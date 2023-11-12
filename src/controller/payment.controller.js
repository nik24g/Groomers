const AppointmentModel = require("../models/client/appointment.model")
const PaymentModel = require("../models/users/payment.model")
const SlotModel = require("../models/client/slot.model")
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant")
const { v4: uuidv4 } = require('uuid');
const { isSlotsAvailable } = require("../services/slotAvailability")
const crypto = require('crypto');
const Buffer = require('buffer').Buffer;
const { refund } = require("../services/refund")
const RefundModel = require("../models/users/refund.model")
const {sendConfirmationEmail} = require("../services/email.service")

async function initiatePayment(price, appointmentId, userId) {
    // Define your payload, salt key, and salt index
    // http://localhost:3000/salon/payment/{id}/true/{Verfication_Token}
    const redirectUrl = "https://nitingoswamiportfolio.netlify.app"
    const callbackUrl = "https://www.groomer.live/payment/phonepe-callback"
    const payload = {
        "merchantId": process.env.MARCHANT_ID,
        "merchantTransactionId": appointmentId,
        "merchantUserId": userId,
        "amount": price * 100,
        "redirectUrl": `${redirectUrl}/${appointmentId}`,
        "redirectMode": "REDIRECT",
        "callbackUrl": callbackUrl,
        "mobileNumber": "7999676443",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    };
    // console.log("payload:", payload);
    const saltKey = process.env.PG_SALT_KEY;
    const saltIndex = process.env.PG_SALT_INDEX;

    // Convert the payload to a JSON string and base64 encode it
    const payloadString = JSON.stringify(payload);
    const base64EncodedPayload = Buffer.from(payloadString).toString('base64');

    // Concatenate the components
    const concatenatedString = base64EncodedPayload + '/pg/v1/pay' + saltKey;

    // Hash the concatenated string using SHA-256
    const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');

    // Combine the hash, "###", and salt index to create the X-VERIFY header
    const xVerifyHeader = hash + '###' + saltIndex;

    // console.log('X-VERIFY Header:', xVerifyHeader);
    // console.log("encoded payload:", base64EncodedPayload);
    const url = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
    const options = {
        method: 'POST',
        headers: { accept: 'application/json', 'Content-Type': 'application/json', "X-VERIFY": xVerifyHeader },
        body: JSON.stringify({ "request": base64EncodedPayload })
    };

    let paymentData = await fetch(url, options)
    paymentData = await paymentData.json()
    // console.log("paymentData: ", paymentData)
    return paymentData
}

async function handleCallback(req, res) {
    // Handle the PhonePe callback to update the payment status
    // Verify the callback's authenticity (signature, etc.)
    // Update your database with the payment status
    const transectionId = req.body.data.merchantTransactionId
    if (req.body.code == "PAYMENT_SUCCESS") {
        const payment = await PaymentModel.findOneAndUpdate({ payment_merchant_transaction_id: transectionId }, { payment_code: req.body.code, payment_status: "complete", payment_method: response.data.paymentInstrument.type, payment_transaction_id: req.body.data.transactionId, payment_options: JSON.stringify(req.body) })
    }
    else if (req.body.code == "PAYMENT_PENDING") {
        const payment = await PaymentModel.findOneAndUpdate({ payment_merchant_transaction_id: transectionId }, { payment_code: req.body.code, payment_status: "pending", payment_method: response.data.paymentInstrument.type, payment_transaction_id: req.body.data.transactionId, payment_options: JSON.stringify(req.body) })
    }
    else {
        const payment = await PaymentModel.findOneAndUpdate({ payment_merchant_transaction_id: transectionId }, { payment_code: req.body.code, payment_status: "failed", payment_method: response.data.paymentInstrument.type, payment_transaction_id: req.body.data.transactionId, payment_options: JSON.stringify(req.body) })
    }
    console.log("here we go in hadle call back");
    res.sendStatus(200); // Respond with a success status
}


const chechPaymentStatus = async (req, res) => {
    try {
        const transactionId = req.params.transactionId
    let payment = await PaymentModel.findOne({ payment_merchant_transaction_id: transactionId })
    // now check with payment obj that is it updated after payment in callback url or not
    if (payment.payment_status == "initiated" || payment.payment_status == "pending") {
        // it means callback url may not triggered now we will update in payment table and appointment table
        // or it may means that payment is pending front end requesting again for payment status
        // first we need to take status of payment from phonePe
        const merchantId = process.env.MARCHANT_ID;
        const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
        const saltIndex = '1';

        // Construct the message string
        const message = `/pg/v1/status/${merchantId}/${transactionId}${saltKey}`;

        // Calculate the SHA-256 hash
        const hashResult = crypto.createHash('sha256').update(message).digest('hex');

        // Append the delimiter and salt index
        const xVerifyHeader = `${hashResult}###${saltIndex}`;
        const url = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${process.env.MARCHANT_ID}/${transactionId}`;
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'Content-Type': 'application/json', 'X-MERCHANT-ID': process.env.MARCHANT_ID, "X-VERIFY": xVerifyHeader }
        };

        let response = await fetch(url, options)
        response = await response.json()
        // checking payment status coming from phonepe
        if (response.code == "PAYMENT_SUCCESS") {
            // payment is success now we can update payment table as success and also in appointment table 
            // also we will update slot availability that it is booked now or slot -1

            //updating payment
            await PaymentModel.findOneAndUpdate({ payment_merchant_transaction_id: transactionId }, { payment_code: response.code, payment_status: "complete", payment_method: response.data.paymentInstrument.type, payment_transaction_id: response.data.transactionId, payment_options: JSON.stringify(response) })
            payment = await PaymentModel.findOne({ payment_merchant_transaction_id: transactionId })
            // before updating appointment and slots we need to check that all selected slots is available or not. if any of them is not available then we need to cancel the appoitment and refund the payment
            const appointment = await AppointmentModel.findOne({ appointment_booking_id: transactionId })
            const slotsAvailability = await isSlotsAvailable(appointment.appointment_slot_uuids)
            // console.log("slotAvailability: ", slotsAvailability);
            if (!slotsAvailability) {
                // it means one of the selected slot is not available due to inactivity of already booked so now we will initiate refund
                // now creating new row in refund table
                // we will also update appointment status in appointment table
                const refundData = await refund(payment.payment_user_uuid, payment.payment_transaction_id, payment.payment_merchant_transaction_id, payment.payment_amount)
                // console.log("refundData: ", refundData);
                // console.log("payment: ", payment);
                const refundObj = new RefundModel({
                    refund_uuid: uuidv4(),
                    refund_user_uuid: payment.payment_user_uuid,
                    refund_salon_uuid: appointment.appointment_salon_uuid,
                    refund_amount: payment.payment_amount,
                    refund_merchant_transaction_id: payment.payment_merchant_transaction_id,
                    refund_transaction_id: refundData.data.transactionId,
                    refund_status: "initiated",
                    refund_code: refundData.code,
                    refund_options: JSON.stringify(refundData)
                })
                await refundObj.save()
                // updating appointment status 
                appointment.appointment_status = "rejected"
                appointment.appointment_payment_status = "refund"
                appointment.appointment_is_payment_done = true
                appointment.appointment_refund_amount = payment.payment_amount
                appointment.appointment_payment_method = payment.payment_method
                await appointment.save()
                await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.APPOINTMENT_REJECTED, "<h2>Your appointment is rejected due to slot unavailability</h2>")
                return res.status(409).json(successResponse(409, messages.success.REFUND_SLOT_ALREADY_BOOKED, {}))
            }
            // now all selected slots are available so we can update
            // updating appointment as for success booking
            // checking is appointment is re-appointment or is this rescheduled appointment or not if yes then update appointment in that way
            if(appointment.appointment_previous_appointment_uuid){
                // it means it is re-appointment so we will update old appointment also 
                const oldAppointment = await AppointmentModel.findOne({appointment_uuid: appointment.appointment_previous_appointment_uuid})
                oldAppointment.appointment_status = "rescheduled"
                oldAppointment.appointment_is_active = false
                await oldAppointment.save()
                // also we need to update old slot timings status like we need to add +1 in their slot_count
                const oldSlotUuids = oldAppointment.appointment_slot_uuids
                for (const uuid of oldSlotUuids) {
                    const slot = await SlotModel.findOne({slot_uuid: uuid})
                    if (slot.slot_count == 0){
                        slot.slot_count = 1
                        slot.slot_isActive = true
                        slot.slot_status = "available"
                    }
                    else{
                        slot.slot_count += 1
                    }
                    await slot.save()
                }
            }
            appointment.appointment_status = "booked"
            appointment.appointment_payment_status = "completed"
            appointment.appointment_is_payment_done = true
            appointment.appointment_is_active = true
            appointment.appointment_payment_method = payment.payment_method
            await appointment.save()

            // updating slot
            const slotUuids = appointment.appointment_slot_uuids
            for (const uuid of slotUuids) {
                const slot = await SlotModel.findOne({ slot_uuid: uuid })
                const slotCount = slot.slot_count
                if (slotCount == 1) {
                    slot.slot_count = slotCount - 1
                    slot.slot_status = "fully booked"
                    slot.slot_isActive = false
                    await slot.save()
                }
                else {
                    slot.slot_count = slotCount - 1
                    await slot.save()
                }
            }
            await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.APPOINTMENT_BOOKED, "<h2>Your appointment is Booked.</h2>")
            return res.status(202).json(successResponse(202, messages.success.APPOINTMENT_BOOKED, {}))
        }
        else if (response.code == "PAYMENT_PENDING") {
            // here payment is pending so front end need to send req for check payment status after 5 second
            // updating payment in db as pending
            await PaymentModel.findOneAndUpdate({ payment_merchant_transaction_id: transactionId }, { payment_code: response.code, payment_status: "pending", payment_transaction_id: response.data.transactionId, payment_options: JSON.stringify(response) })
            return res.status(206).json(successResponse(206, messages.success.PAYMENT_PENDING, {}))
        }
        else {
            // here payment is failed due to any reseason
            await PaymentModel.findOneAndUpdate({ payment_merchant_transaction_id: transactionId }, { payment_code: response.code, payment_status: "failed", payment_transaction_id: response.data.transactionId, payment_options: JSON.stringify(response) })
            await AppointmentModel.findByIdAndUpdate({ appointment_booking_id: transactionId }, { appointment_status: "rejected", appointment_payment_status: "failed" })
            await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.PAYMENT_FAILED, "<h2>Your payment is failed due to any reason.</h2>")
            return res.status(402).json(errorResponse(402, messages.error.PAYMENT_FAILED, {}))
        }
    }
    else {
        // it means callback url triggered and payment table is updated already so now we will update appointment table only 
        // here we dont need to check payments status from phonePe we can directly updated appointment status
        if (payment.payment_status == "complete") {
            // payment is completed now we will check is selected slots are available or not if not then we will initiate refund.
            // if slots available then we will update slots and appoitment
            // also we will update slot availability that it is booked now or slot -1

            // before updating appointment and slots we need to check that all selected slots is available or not. if any of them is not available then we need to cancel the appoitment and refund the payment
            const appointment = await AppointmentModel.findOne({ appointment_booking_id: transactionId })
            const slotsAvailability = await isSlotsAvailable(appointment.appointment_slot_uuids)
            if (!slotsAvailability) {
                // it means one of the selected slot is not available due to inactivity of already booked so now we will initiate refund
                // now creating new row in refund table
                // we will also update appointment status in appointment table
                const refundData = await refund(payment.payment_user_uuid, payment.payment_transaction_id, payment.payment_merchant_transaction_id, payment.payment_amount)
                const refundObj = new RefundModel({
                    refund_uuid: uuidv4(),
                    refund_user_uuid: payment.payment_user_uuid,
                    refund_salon_uuid: appointment.appointment_salon_uuid,
                    refund_amount: payment.payment_amount,
                    refund_merchant_transaction_id: payment.payment_merchant_transaction_id,
                    refund_transaction_id: refundData.data.transactionId,
                    refund_status: "initiated",
                    refund_code: refundData.code,
                    refund_options: JSON.stringify(refundData)
                })
                await refundObj.save()

                // updating appointment status 
                appointment.appointment_status = "rejected"
                appointment.appointment_payment_status = "refund"
                appointment.appointment_is_payment_done = true
                appointment.appointment_refund_amount = payment.payment_amount
                appointment.appointment_payment_method = payment.payment_method
                await appointment.save()
                await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.APPOINTMENT_REJECTED, "<h2>Your appointment is rejected due to slot unavailability</h2>")
                return res.status(409).json(successResponse(409, messages.success.REFUND_SLOT_ALREADY_BOOKED, {}))
            }
            // now all selected slots are available so we can update
            // updating appointment as for success booking
            // checking is appointment is re-appointment or is this rescheduled appointment or not if yes then update appointment in that way
            if(appointment.appointment_previous_appointment_uuid){
                // it means it is re-appointment so we will update old appointment also 
                const oldAppointment = await AppointmentModel.findOne({appointment_uuid: appointment.appointment_previous_appointment_uuid})
                oldAppointment.appointment_status = "rescheduled"
                oldAppointment.appointment_is_active = false
                await oldAppointment.save()
                // also we need to update old slot timings status like we need to add +1 in their slot_count
                const oldSlotUuids = oldAppointment.appointment_slot_uuids
                for (const uuid of oldSlotUuids) {
                    const slot = await SlotModel.findOne({slot_uuid: uuid})
                    if (slot.slot_count == 0){
                        slot.slot_count = 1
                        slot.slot_isActive = true
                        slot.slot_status = "available"
                    }
                    else{
                        slot.slot_count += 1
                    }
                    await slot.save()
                }
            }
            appointment.appointment_status = "booked"
            appointment.appointment_payment_status = "completed"
            appointment.appointment_is_payment_done = true
            appointment.appointment_is_active = true
            appointment.appointment_payment_method = payment.payment_method
            await appointment.save()

            // updating slot
            const slotUuids = appointment.appointment_slot_uuids
            for (const uuid of slotUuids) {
                const slot = await SlotModel.findOne({ slot_uuid: uuid })
                const slotCount = slot.slot_count
                if (slotCount == 1) {
                    slot.slot_count = slotCount - 1
                    slot.slot_status = "fully booked"
                    slot.slot_isActive = false
                    await slot.save()
                }
                else {
                    slot.slot_count = slotCount - 1
                    await slot.save()
                }
            }
            await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.APPOINTMENT_BOOKED, "<h2>Your appointment is Booked</h2>")
            return res.status(202).json(successResponse(202, messages.success.APPOINTMENT_BOOKED, {}))

        }
        else {
            // it means payment is failed due to any reason so now update appointment only as rejected
            // we are updating appointment only. not updating payment because it is updated already in callBackUrl api
            await AppointmentModel.findByIdAndUpdate({ appointment_booking_id: transactionId }, { appointment_status: "rejected", appointment_payment_status: "failed" })
            await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.PAYMENT_FAILED, "<h2>Your Payment is failed due to any reason.</h2>")
            return res.status(402).json(errorResponse(402, messages.error.PAYMENT_FAILED, {}))
        }
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG, {}))
    }
}


const refundCallBack = async (req, res) => {
    // Handle the PhonePe callback to update the refund status
    // Verify the callback's authenticity (signature, etc.)
    // Update your database with the payment status
    const transectionId = req.body.data.merchantTransactionId
    if (req.body.code == "PAYMENT_SUCCESS") {
        const refund = await RefundModel.findOneAndUpdate({ refund_merchant_transaction_id: transectionId }, { refund_code: req.body.code, refund_status: "complete", refund_transaction_id: req.body.data.transactionId, refund_options: JSON.stringify(req.body) })
    }
    else if (req.body.code == "PAYMENT_PENDING") {
        const refund = await RefundModel.findOneAndUpdate({ refund_merchant_transaction_id: transectionId }, { refund_code: req.body.code, refund_status: "pending", refund_transaction_id: req.body.data.transactionId, refund_options: JSON.stringify(req.body) })
    }
    else {
        const refund = await RefundModel.findOneAndUpdate({ refund_merchant_transaction_id: transectionId }, { refund_code: req.body.code, refund_status: "failed", refund_transaction_id: req.body.data.transactionId, refund_options: JSON.stringify(req.body) })
    }
    console.log("here we go in hadle refund call back");
    res.sendStatus(200); // Respond with a success status
}

module.exports = {
    initiatePayment,
    handleCallback,
    chechPaymentStatus,
    refundCallBack
};