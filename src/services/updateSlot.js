const SlotModel = require("../models/client/slot.model")

const increaseSlotsCount = async (uuids) => {
    // here uuids will be array of uuids of slots 
    for (const uuid of uuids) {
        const slot = await SlotModel.findOne({slot_uuid: uuid})
        if(slot.slot_count == 0){
            slot.slot_count = 1
            slot.slot_isActive = true
            slot.slot_status = "available"
            await slot.save()
        }
        else{
            slot.slot_count += 1
            await slot.save()
        }
    }
}
module.exports = {increaseSlotsCount}
//developed by Nitin Goswami