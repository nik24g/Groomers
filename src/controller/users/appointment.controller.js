const userModel = require("../../models/users/user.model");
const SalonModel = require('../../models/client/salon.model')
const SlotModel = require("../../models/client/slot.model");
const PaymentModel = require("../../models/users/payment.model")
const AppointmentModel = require("../../models/client/appointment.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");
const {createOrder, razorpay} = require("../../utils/razorpay.util")
const {initiatePayment} = require("../payment.controller")

// note: we will not subtract slot count or sitting count untill payment is complete
//if payment fails then we will not subtract count but if payment success then we will subtract it.
// appointment uuid will be also transection id
// appointment status will be pending, booked, cancelled
// appointment payment status will be pending, complete, failed
const newAppointment = async (req) =>{
    const receivedUserUuid = req.uuid
    const receivedSalonUuid = req.body.salon_uuid
    const slotUuids = req.body.slot_uuids || []
    const duration = req.body.duration
    const timing = req.body.timing
    const receivedServices = req.body.services || []
    const receivedCombos = req.body.combos || []
    const isGuestAppointment = req.body.is_guest_appointment || false
    const guestFullName = req.body.full_name
    const guestMobile = req.body.mobile
    const appointmentBookingId = uuidv4()

    const salon = await SalonModel.findOne({salon_uuid: receivedSalonUuid})
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
        appointment_date: moment().format("DD/MM/YYYY"),
        appointment_user_phone: guestMobile || req.mobile,
        appointment_user_full_name: guestFullName || req.fullName,
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
    await newPayment.save()
    return successResponse(201, messages.success.SUCCESS, {order: payment})
}
module.exports = {newAppointment}