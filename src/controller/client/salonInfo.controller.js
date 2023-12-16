const SalonModel = require("../../models/client/salon.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const SlotModel = require("../../models/client/slot.model")
const moment = require('moment');

const salonInfo = async (req) => {
    const today = moment
    const slots = await SlotModel.find({slot_salon_uuid: req.uuid, slot_date: today().format("DD/MM/YYYY")}).select("-_id slot_uuid slot_date slot_time slot_count slot_status slot_isActive slot_isExpire")
    const salon = await SalonModel.findOne({salon_uuid: req.uuid}).select("-_id salon_name salon_type salon_address salon_area salon_city salon_state salon_location salon_username salon_code salon_slots salon_block_dates")
    return successResponse(200, messages.success.SUCCESS, {salon, slots})
}

module.exports = salonInfo

//developed by Nitin Goswami