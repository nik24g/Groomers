const userModel = require("../../models/users/user.model");
const SalonModel = require('../../models/client/salon.model')
const SlotModel = require("../../models/client/slot.model");
const AppointmentModel = require("../../models/client/appointment.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { v4: uuidv4 } = require('uuid');
const moment = require("moment");

const newAppointment = async (req) =>{
    const receivedUserUuid = req.body.user_uuid
    const receivedSalonUuid = req.body.salon_uuid
    const slotUuids = req.body.slot_uuids || []
    const duration = req.body.duration
    const timing = req.body.timing
    const receivedServices = req.body.services || []
    const receivedCombos = req.body.combos || []

    const salon = await SalonModel.findOne({salon_uuid: receivedSalonUuid})
    // getting services or combos that user selected 
    const services = salon.salon_services.filter(item => receivedServices.includes(item.service_name));
    const combos = salon.salon_combo_services.filter(item => receivedCombos.includes(item.combo_name));

    // now calculating subtotal of services after discount 
    let totalDiscountedPrice = 0;
    let totalOriginalPrice = 0;
    // calculating if user selected services 
    if(services.length){
        services.forEach(item => {
            const originalPrice = parseFloat(item.service_original_price);
            const discount = parseFloat(item.service_discount);
            const discountedPrice = originalPrice - (originalPrice * (discount / 100));
            totalDiscountedPrice += discountedPrice;
            totalOriginalPrice += originalPrice;

            item.discounted_price = discountedPrice.toFixed(2);
            item.original_price = originalPrice.toFixed(2); // Adding original_price to the item
        });
    }
    // calculating if user selected combo 
    else if(combos.length){
        combos.forEach(item => {
            const originalPrice = parseFloat(item.combo_price);
            const discount = parseFloat(item.service_discount) || 0;
            const discountedPrice = originalPrice - (originalPrice * (discount / 100));
            totalDiscountedPrice += discountedPrice;
            totalOriginalPrice += originalPrice;

            item.discounted_price = discountedPrice.toFixed(2);
            item.original_price = originalPrice.toFixed(2); // Adding original_price to the item
        });
    }
    const newAppointment = new AppointmentModel({
        appointment_uuid: uuidv4(),
        appointment_user_uuid: receivedUserUuid,
        appointment_salon_uuid: receivedSalonUuid,
        appointment_slot_uuids: slotUuids,
        appointment_duration: duration,
        appointment_timing: timing,
        appointment_services: services,
        appointment_combos: combos,
        appointment_date: moment().format("DD/MM/YYYY"),
        appointment_user_phone: req.mobile,
        appointment_user_full_name: req.fullName,
        appointment_status: "pending",
        appointment_original_price: totalOriginalPrice,
        appointment_discounted_price: totalDiscountedPrice,
        appointment_subtotal: totalDiscountedPrice,
        appointment_payment_status: "pending"
    })
    await newAppointment.save()
    return successResponse(201, messages.success.SUCCESS, {})
}
module.exports = {newAppointment}