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

const toggleSalon = async (req) => {
    const salonCode = req.body.salon_code
    const salon = await SalonModel.findOne({salon_code: salonCode})
    if(!salon) return errorResponse(200, messages.error.NO_SALON_FOUND, {})
    if(salon.salon_isActive){
        salon.salon_isActive = false
        await salon.save()
        return successResponse(200, messages.success.SALON_DISABLE, {})
    }
    else{
        salon.salon_isActive = true
        await salon.save()
        return successResponse(200, messages.success.SALON_ENABLE, {})
    }
}

const salonCode = async (req) => {
    const searchKey = req.query.key
    if (!searchKey) return errorResponse(400, messages.error.CODE_CHAR_REQ, {})
    if(searchKey.length != 3) return errorResponse(400, messages.error.CODE_CHAR_LEN, {})
    const salon = await SalonModel.findOne({
        salon_code: { $regex: `^${searchKey}`, $options: "i" }
    }).sort({ createdAt: -1 }).exec();
    if(salon){
        const salonCode = salon.salon_code
        const salonCount = parseInt(salonCode.substring(3)) + 1
        const newSalonCode = searchKey + salonCount
        return successResponse(200, messages.success.SUCCESS, {salonCode: newSalonCode})
    }
    else{
        const newSalonCode = searchKey + "1"
        return successResponse(200, messages.success.SUCCESS, {salonCode: newSalonCode})
    }
}
module.exports = {deleteSalonBySalonId, toggleSalon, salonCode}