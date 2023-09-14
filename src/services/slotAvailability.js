const SlotModel = require("../models/client/slot.model")

const isSlotsAvailable = async (uuids) =>{
    for (const uuid of uuids) {
        const slot = await SlotModel.findOne({slot_uuid: uuid})
        if (slot.slot_count == 0 || slot.slot_isActive == false){
            return false
        }
    }
}

module.exports = {isSlotsAvailable}