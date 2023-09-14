const SalonModel = require("../../models/client/salon.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const getSalonById = async (req)=>{
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
const getAllSalons = async (req)=>{
    const salons = await SalonModel.find().select("-_id salon_uuid salon_name salon_code")
    return successResponse(200, messages.success.SUCCESS, salons)
}
module.exports = {getSalonById, getAllSalons};