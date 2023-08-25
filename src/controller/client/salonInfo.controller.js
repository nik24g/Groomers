const SalonModel = require("../../models/client/salon.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const SlotModel = require("../../models/client/slot.model")
const moment = require('moment');

const salonInfo = async (req) => {
    const today = moment
    const slots = await SlotModel.find({slot_salon_uuid: req.uuid, slot_date: today().format("DD/MM/YYYY")}).select("-_id slot_uuid slot_date slot_isActive")
    const salon = await SalonModel.findOne({salon_uuid: req.uuid}).select("-_id salon_name salon_address salon_username salon_code")
    const payload = {salonName: salon.salon_name, slots: slots}
    return successResponse(200, messages.success.SUCCESS, {salonName: salon, slots: slots})
}

module.exports = salonInfo