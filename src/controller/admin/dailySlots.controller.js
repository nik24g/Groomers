const SalonModel = require("../../models/client/salon.model")
const SlotModel = require("../../models/client/slot.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");
const generateSlotOnDaily = require("../../services/dailyGenerateSlots")
const moment = require('moment');

const generateDailySlots = async (req)=>{
    const today = moment
    const salon = await SalonModel.find({salon_isActive: true}).select("salon_uuid -_id")
    const allUuid = salon.map((uuidObj)=>{
        const uuid = uuidObj.salon_uuid
        return uuid
    })
    // expiring last days slots
    await SlotModel.updateMany({slot_date: today().subtract(1, "days").format("DD/MM/YYYY")}, {slot_isExpire: true, slot_isActive: false, slot_status: "expired"})
    const response = await generateSlotOnDaily(allUuid)
    return successResponse(201, response, {})

    // await SlotModel.updateMany(
    //     { slot_date: today.clone().subtract(1, "days").format("DD/MM/YYYY") },
    //     { slot_isExpire: true, slot_isActive: false, slot_status: "expired" }
    //   );
    
    // // Generating slots for the next day
    // await generateSlotOnDaily(allUuid, today.clone().add(1, "days").format("DD/MM/YYYY"));
    
    // const response = "Slots for the next day generated and previous day slots expired.";
    // return successResponse(201, response, {});
}

module.exports = generateDailySlots