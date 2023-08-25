const SlotModel = require("../../models/client/slot.model")
const SalonModel = require("../../models/client/salon.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const moment = require('moment');

const disableSlot = async (req) => {
    const slot = await SlotModel.findOne({slot_salon_uuid: req.uuid, slot_date: moment().format("DD/MM/YYYY"), slot_isExpire: false})
    const countAfterDisable = Number(slot.slot_count) - 1
    if(countAfterDisable == -1){
        return successResponse (200, messages.success.REACHED_LIMIT, {})
    }
    if (countAfterDisable == 0){
        await SlotModel.updateMany({slot_salon_uuid: req.uuid, slot_date: moment().format("DD/MM/YYYY"), slot_isActive: true, slot_isExpire: false}, {slot_count: countAfterDisable, slot_isActive: false})
        return successResponse (200, messages.success.SLOT_DISABLE, {})
    }
    else{
        await SlotModel.updateMany({slot_salon_uuid: req.uuid, slot_date: moment().format("DD/MM/YYYY"), slot_isActive: true, slot_isExpire: false}, {slot_count: countAfterDisable})
        return successResponse (200, messages.success.SLOT_DISABLE, {})
    }
}
const enableSlot = async (req) => {
    const salon = await SalonModel.findOne({salon_uuid: req.uuid})
    const slot = await SlotModel.findOne({slot_salon_uuid: req.uuid, slot_date: moment().format("DD/MM/YYYY"), slot_isExpire: false})
    const countAfterEnable = Number(slot.slot_count) + 1
    if (countAfterEnable <= salon.salon_slots){
        await SlotModel.updateMany({slot_salon_uuid: req.uuid, slot_date: moment().format("DD/MM/YYYY"), slot_isExpire: false}, {slot_count: countAfterEnable, slot_isActive: true})
        return successResponse (200, messages.success.SLOT_ENABLE, {})
    }
    else {
        return successResponse (200, messages.success.REACHED_LIMIT, {})
    }
}

module.exports = {enableSlot, disableSlot}