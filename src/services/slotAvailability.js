const SlotModel = require("../models/client/slot.model")

const isSlotsAvailable = async (slotUuids) =>{
    for (let i = 0; i < slotUuids.length; i++) {
        const slotUuid = slotUuids[i];
        const slot = await SlotModel.findOne({slot_uuid: slotUuid, slot_isActive: true, slot_isExpire: false})
        if (!slot){
            return false;
        }
    }
    return true
}

module.exports = {isSlotsAvailable}
//developed by Nitin Goswami