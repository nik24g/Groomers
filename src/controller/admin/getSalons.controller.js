const SalonModel = require("../../models/client/salon.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const getSalon = async (req)=>{
    if (req.query.code){
        const salonCode = req.query.code.toUpperCase();
        const salon = await SalonModel.findOne({salon_code: salonCode})
        if(!salon) return errorResponse(404, messages.error.NO_SALON_FOUND, {})
        return successResponse(200, messages.success.SUCCESS, salon)
    }
    else{
        const salons = await SalonModel.find()
        return successResponse(200, messages.success.SUCCESS, salons)
    }
}

module.exports = getSalon;