const SalonModel = require("../../models/client/salon.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")

const deleteSalonBySalonId = async (req, res) => {
    const salonCode = req.body.salon_code
    // first we will check, is there any salon exists with this given id
    const salon = await SalonModel.findOne({salon_code: salonCode})
    if(!salon) return errorResponse(200, messages.error.NO_SALON_FOUND, {})
    await SalonModel.findOneAndDelete({salon_code: salonCode})
    return successResponse(200, messages.success.SALON_DELETED, {})
}
module.exports = {deleteSalonBySalonId}