const SalonModel = require("../../models/client/salon.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");
const generateSlotOnBoardService = require("../../services/onboardGenerateSlots")

const generateSlot = async (req)=>{
    const salonCode = req.body.salon_code
    const salon = await SalonModel.findOne({salon_code: salonCode})
    if (!salon) return errorResponse(404, messages.error.WRONG_SALON_CODE, {})
    if(salon.salon_isActive == false) return errorResponse(403, messages.error.SALON_NOT_ACTIVE, {})
    const response = await generateSlotOnBoardService(salon.salon_uuid)
    return successResponse(201, response, {})
    
}

module.exports = generateSlot
//developed by Nitin Goswami