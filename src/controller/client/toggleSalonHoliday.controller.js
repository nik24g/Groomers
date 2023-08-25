const SlotModel = require("../../models/client/slot.model")
const SalonModel = require("../../models/client/salon.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const moment = require('moment');

const toggleSalonHoliday = async (req) =>{
    const today = moment
    const salonUuid = req.uuid
    const salon = await SalonModel.findOne({salon_uuid: salonUuid})
    console.log(salon);
    if(salon.salon_block_dates.includes(today().format("DD/MM/YYYY"))){
        await SalonModel.findOneAndUpdate({salon_uuid: salonUuid}, {$pull: {salon_block_dates: today().format("DD/MM/YYYY")}})
        return successResponse(200, messages.success.SUCCESS, {toggle: "Salon is Opened for today"})
    }
    else{
        await SalonModel.findOneAndUpdate({salon_uuid: salonUuid}, {$push: {salon_block_dates: today().format("DD/MM/YYYY")}})
        return successResponse(200, messages.success.SUCCESS, {toggle: "Salon is Closed for today"})
    }
}
module.exports = toggleSalonHoliday