const SalonModel = require("../../models/client/salon.model")
const SlotModel = require("../../models/client/slot.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");
const generateSlotOnDaily = require("../../services/dailyGenerateSlots")
const moment = require('moment');

const generateDailySlots = async (req)=>{
    const today = moment
    const salon = await SalonModel.find().select("salon_uuid -_id")
    const allUuid = salon.map((uuidObj)=>{
        const uuid = uuidObj.salon_uuid
        return uuid
    })
    // expiring last days slots
    await SlotModel.updateMany({slot_date: today().subtract(1, "days").format("DD/MM/YYYY")}, {slot_isExpire: true, slot_isActive: false, slot_status: "expired"})
    const response = await generateSlotOnDaily(allUuid)
    return successResponse(201, response, {})
}

module.exports = generateDailySlots