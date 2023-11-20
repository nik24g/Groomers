const userModel = require("../../models/users/user.model");
const SalonModel = require('../../models/client/salon.model')
const SlotModel = require("../../models/client/slot.model");
const PaymentModel = require("../../models/users/payment.model")
const AppointmentModel = require("../../models/client/appointment.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");
// const { createOrder, razorpay } = require("../../utils/razorpay.util")
const { initiatePayment } = require("../payment.controller")
const RefundModel = require("../../models/users/refund.model")
const { refund } = require("../../services/refund")
const { increaseSlotsCount } = require("../../services/updateSlot")
const { sendConfirmationEmail } = require("../../services/email.service")
const { bookingId } = require("../../services/id")

// note: we will not subtract slot count or sitting count untill payment is complete
// if payment fails then we will not subtract count but if payment success then we will subtract it.
// appointment uuid will be also transection id
// appointment status will be pending, booked, cancelled
// appointment payment status will be pending, complete, failed
const newAppointment = async (req) => {
    const receivedUserUuid = req.uuid
    const receivedSalonUuid = req.body.salon_uuid
    // for slot uuids we are using middleware for validating and getting from database then attach with request object
    const slotUuids = req.slotUuids
    const duration = req.body.duration
    const timing = req.body.timing
    const date = req.body.date
    const receivedServices = req.body.services || []
    const receivedCombos = req.body.combos || []
    const isGuestAppointment = req.body.is_guest_appointment || false
    const guestFullName = req.body.full_name
    const guestMobile = req.body.mobile
    const guestEmail = req.body.email
    const appointmentBookingId = await bookingId()

    const salon = await SalonModel.findOne({ salon_uuid: receivedSalonUuid })
    // getting services or combos that user selected 
    const services = salon.salon_services.filter(item => receivedServices.includes(item.service_name));
    const combos = salon.salon_combo_services.filter(item => receivedCombos.includes(item.combo_name));
    // now calculating subtotal, originalPrice and discountedPrice
    let totalDiscountedPrice = 0;
    let totalOriginalPrice = 0;
    let subtotal = 0;
    // calculating if user selected services 
    services.forEach(item => {
        const originalPrice = parseFloat(item.service_original_price);
        const discountedPrice = parseFloat(item.service_discount);
        totalDiscountedPrice += discountedPrice;
        totalOriginalPrice += originalPrice;
        subtotal += totalDiscountedPrice;
    });
    // calculating if user selected combo 
    combos.forEach(item => {
        const originalPrice = parseFloat(item.combo_price);
        totalDiscountedPrice += originalPrice;
        totalOriginalPrice += originalPrice;
        subtotal += originalPrice;
    });
    // if it is guest booking then we are taking full name and mobile from front end 
    // if it is not guest booking then full name and mobile is taken from JWT token
    const newAppointment = new AppointmentModel({
        appointment_uuid: uuidv4(),
        appointment_booking_id: appointmentBookingId,
        appointment_is_guest: isGuestAppointment,
        appointment_user_uuid: receivedUserUuid,
        appointment_salon_uuid: receivedSalonUuid,
        appointment_slot_uuids: slotUuids,
        appointment_duration: duration,
        appointment_timing: timing,
        appointment_services: services,
        appointment_combos: combos,
        appointment_date: date,
        appointment_user_phone: guestMobile || req.mobile,
        appointment_user_full_name: guestFullName || req.fullName,
        appointment_user_email: guestEmail || req.email,
        appointment_status: "pending",
        appointment_original_price: totalOriginalPrice,
        appointment_discounted_price: totalDiscountedPrice,
        appointment_subtotal: subtotal,
        appointment_payment_status: "pending"
    })
    await newAppointment.save()
    // creating order for razorpay
    // const order = await createOrder(totalDiscountedPrice, appointmentBookingId)
    const payment = await initiatePayment(subtotal, appointmentBookingId, receivedUserUuid)
    // storing payment details in db
    const newPayment = new PaymentModel({
        payment_uuid: uuidv4(),
        payment_user_uuid: receivedUserUuid,
        payment_salon_uuid: receivedSalonUuid,
        payment_amount: subtotal,
        payment_merchant_transaction_id: appointmentBookingId,
        payment_status: "initiated",
        payment_code: payment.code
    })
    // console.log(payment);
    await newPayment.save()
    return successResponse(201, messages.success.APPOINTMENT_INITIATED, { order: payment })
}

const cancelAppointment = async (req) => {
    const appointmentUuid = req.params.uuid
    const appointment = await AppointmentModel.findOne({ appointment_uuid: appointmentUuid })
    const appointmentTime = appointment.appointment_timing; // e.g., '9:00 am'
    const appointmentDate = appointment.appointment_date; // e.g., '18/09/2023'
    // there is a condition for cancel the appointment that user can not cancel the appointment if he tries to cancel just 2 hour before appointment
    // so we need to validate that timing with users current time
    // ...validation code
    // Parse the appointment date and time as moment objects
    const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`, 'DD/MM/YYYY h:mm a');
    const currentTime = moment();
    // const currentTime = moment(`19/09/2023 8:00 am`, 'DD/MM/YYYY h:mm a');

    // Check if the appointment time is in the past or within the next hour
    if (currentTime.isAfter(appointmentDateTime) || currentTime.add(2, 'hour').isAfter(appointmentDateTime)) {
        // The appointment cannot be canceled
        return errorResponse(400, messages.error.CAN_NOT_CANCEL, {});
    }
    // we will deduct 15% cancellation charges from subtotal for refund 
    const subtotal = Number(appointment.appointment_subtotal)
    const refundAmount = subtotal - (subtotal * 15 / 100)
    appointment.appointment_refund_amount = refundAmount
    appointment.appointment_status = "cancelled"
    appointment.appointment_is_active = false

    const payment = await PaymentModel.findOne({ payment_merchant_transaction_id: appointment.appointment_booking_id })
    // initiating refund against payment 
    const refundData = await refund(payment.payment_user_uuid, payment.payment_transaction_id, payment.payment_merchant_transaction_id, payment.payment_amount)
    const refundObj = new RefundModel({
        refund_uuid: uuidv4(),
        refund_user_uuid: payment.payment_user_uuid,
        refund_salon_uuid: appointment.appointment_salon_uuid,
        refund_amount: refundAmount,
        refund_merchant_transaction_id: payment.payment_merchant_transaction_id,
        refund_transaction_id: refundData.data.transactionId,
        refund_status: "initiated",
        refund_code: refundData.code,
        refund_options: JSON.stringify(refundData)
    })
    await refundObj.save()
    await appointment.save()
    // after initiating refund we need to update slot availability because of appointment cancellation one slot is now available for other users
    await increaseSlotsCount(appointment.appointment_slot_uuids)
    await sendConfirmationEmail(appointment.appointment_user_email, messages.subject.APPOINTMENT_CANCEL, "<h1>your appointment is now cancelled</h1>")
    return successResponse(200, messages.success.APPOINTMENT_CANCEL, {})
}

const reScheduleAppointment = async (req) => {
    // use can not re-schedule appointment within and after appointment time.
    const appointmentUuid = req.body.appointment_uuid
    const slotUuids = req.slotUuids
    const timing = req.body.timing
    const date = req.body.date
    const appointmentBookingId = await bookingId()

    const appointment = await AppointmentModel.findOne({ appointment_uuid: appointmentUuid })

    const appointmentTime = appointment.appointment_timing; // e.g., '9:00 am'
    const appointmentDate = appointment.appointment_date; // e.g., '18/09/2023'
    // there is a condition for reschedule the appointment that user can not reschedule the appointment if he tries to reschedule just 1 hour before appointment time
    // so we need to validate that timing with users current time
    // ...validation code
    // Parse the appointment date and time as moment objects
    const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`, 'DD/MM/YYYY h:mm a');
    const currentTime = moment();
    // const currentTime = moment(`22/09/2023 9:15 am`, 'DD/MM/YYYY h:mm a');

    // Check if the appointment time is in the past or within the next hour
    if (currentTime.isAfter(appointmentDateTime) || currentTime.add(1, 'hour').isAfter(appointmentDateTime)) {
        // The appointment cannot be canceled
        return errorResponse(400, messages.error.CAN_NOT_RESCHEDULE, {});
    }

    // calculating subtotal
    // as this is reschedule so user already done payment for services but he need to pay 10% of reschedule charges.
    const rescheduleCharge = parseFloat(appointment.appointment_subtotal) * 10 / 100
    const newAppointment = new AppointmentModel({
        appointment_uuid: uuidv4(),
        appointment_is_reappointment: true,
        appointment_previous_appointment_uuid: appointmentUuid,
        appointment_booking_id: appointmentBookingId,
        appointment_is_guest: appointment.appointment_is_guest,
        appointment_user_uuid: appointment.appointment_user_uuid,
        appointment_salon_uuid: appointment.appointment_salon_uuid,
        appointment_slot_uuids: slotUuids,
        appointment_duration: appointment.appointment_duration,
        appointment_timing: timing,
        appointment_services: appointment.appointment_services,
        appointment_combos: appointment.appointment_combos,
        appointment_date: date,
        appointment_user_phone: appointment.appointment_user_phone,
        appointment_user_full_name: appointment.appointment_user_full_name,
        appointment_status: "pending",
        appointment_previous_payment: appointment.appointment_previous_payment,
        appointment_subtotal: appointment.appointment_subtotal,
        appointment_other_charges: JSON.stringify({ "rescheduleCharge": rescheduleCharge }),
        appointment_payment_status: "pending"
    })
    await newAppointment.save()

    // now we will initiate payment 
    const payment = await initiatePayment(rescheduleCharge, appointmentBookingId, req.uuid)
    // storing payment details in db
    const newPayment = new PaymentModel({
        payment_uuid: uuidv4(),
        payment_user_uuid: req.uuid,
        payment_salon_uuid: appointment.appointment_salon_uuid,
        payment_amount: rescheduleCharge,
        payment_merchant_transaction_id: appointmentBookingId,
        payment_status: "initiated",
        payment_code: payment.code
    })
    await newPayment.save()
    return successResponse(201, messages.success.RESCHEDULE_APPOINTMENT_INITIATED, { order: payment })
}

const appointments = async (req) => {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Initial match stage with the user's UUID
    const matchStage = {
        $match: {
            appointment_user_uuid: req.uuid
        }
    };

    // Additional match stages based on filters
    if (status) {
        matchStage.$match.appointment_status = status;
    }

    if (startDate && endDate) {
        const parsedStartDate = startDate;
        const parsedEndDate = endDate;

        matchStage.$match.appointment_date = {
            $gte: parsedStartDate,
            $lte: parsedEndDate,
        };
    }

    // Aggregation pipeline with $lookup stage
    const pipeline = [
        matchStage,
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: 'salons', // Replace with the actual collection name
                localField: 'appointment_salon_uuid',
                foreignField: 'salon_uuid',
                as: 'salon'
            }
        },
        {
            $unwind: '$salon'
        },
        {
            $project: {
                _id: 0,
                __v: 0,
                createdAt: 0,
                updatedAt: 0,
                'salon._id': 0,
                'salon.__v': 0,
                'salon.createdAt': 0,
                'salon.updatedAt': 0,
                'salon.salon_password': 0,
                'salon.salon_description': 0,
                'salon.salon_email': 0,
                'salon.salon_type': 0,
                'salon.salon_address': 0,
                'salon.salon_area': 0,
                'salon.salon_state': 0,
                'salon.salon_slots': 0,
                'salon.salon_services': 0,
                'salon.salon_combo_services': 0,
                'salon.salon_opening_time': 0,
                'salon.salon_closing_time': 0,
                'salon.salon_lunch_start_time': 0,
                'salon.salon_lunch_end_time': 0,
                'salon.salon_photos': 0,
                'salon.salon_features': 0,
                'salon.salon_languages': 0,
                'salon.salon_owner_name': 0,
                'salon.salon_owner_mobile': 0,
                'salon.salon_owner_pancard_number': 0,
                'salon.salon_bank_name': 0,
                'salon.salon_bank_account_number': 0,
                'salon.salon_bank_IFSC_code': 0,
                'salon.salon_block_dates': 0,
                'salon.salon_isActive': 0,
                'salon.salon_is_recommended': 0
            }
        }
        
    ];

    // Execute aggregation pipeline
    const [appointments, totalAppointments] = await Promise.all([
        AppointmentModel.aggregate(pipeline),
        AppointmentModel.countDocuments(matchStage.$match)
    ]);

    // Return success response with the appointments and total count
    return successResponse(200, messages.success.SUCCESS, { appointments, totalAppointments });
};

module.exports = { newAppointment, cancelAppointment, reScheduleAppointment, appointments }