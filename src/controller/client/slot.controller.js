const SlotModel = require("../../models/client/slot.model");
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant");
const moment = require("moment");

const toggleSlot = async (req) => {
  const slotUuid = req.body.uuid
  const slot = await SlotModel.findOne({slot_uuid: slotUuid, slot_isExpire: false, slot_date: moment().format("DD/MM/YYYY")})

  // now we will check that this slot releated to this user or not 
  if(slot.slot_salon_uuid != req.uuid) return errorResponse(403, messages.error.NOT_AUTHORIZED, {})
  // now we will check that slot fully booked or not if it is fully booked then client can not toggle the slot
  if(slot.slot_status == "fully booked") return errorResponse(403, messages.error.SLOT_FULLY_BOOKED, {})

  // now we will toggle the slot 
  if(slot.slot_isActive){
    slot.slot_isActive = false
    await slot.save()
    return successResponse(202, messages.success.SLOT_DISABLE, {})
  }
  else{
    slot.slot_isActive = true
    await slot.save()
    return successResponse(202, messages.success.SLOT_ENABLE, {})
  }
};


module.exports = { toggleSlot };
