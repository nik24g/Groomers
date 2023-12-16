const AppointmentModel = require("../../models/client/appointment.model")
const SalonModel = require("../../models/client/salon.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const moment = require('moment');

// if salon have any booking or appointment for that day then client can not mark as holiday for salon 
const toggleSalonHoliday = async (req) =>{
    const today = moment
    const salonUuid = req.uuid
    const salon = await SalonModel.findOne({salon_uuid: salonUuid})
    // here we will check if is there any appointment
    const appointment = await AppointmentModel.find({appointment_salon_uuid: req.uuid, appointment_is_active: true, appointment_date: today().format("DD/MM/YYYY")})
    if (appointment.length > 0){
        return errorResponse(400, messages.error.CAN_NOT_CLOSE_SALON, {})
    }
    if(salon.salon_block_dates.includes(today().format("DD/MM/YYYY"))){
        await SalonModel.findOneAndUpdate({salon_uuid: salonUuid}, {$pull: {salon_block_dates: today().format("DD/MM/YYYY")}})
        return successResponse(200, messages.success.SALON_OPEN, {})
    }
    else{
        await SalonModel.findOneAndUpdate({salon_uuid: salonUuid}, {$push: {salon_block_dates: today().format("DD/MM/YYYY")}})
        return successResponse(200, messages.success.SALON_CLOSE, {})
    }
}
module.exports = toggleSalonHoliday

//developed by Nitin Goswami