const SalonModel = require('../../models/client/salon.model')
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { calculateDistance } = require("../../services/geoLocation")

const salonsByCity = async (req) => {
    const city = req.query.city;
    const userCoordinates = req.query.location;
    if (!city) return errorResponse(400, messages.error.CITY_NAME_REQ, {})
    if (!userCoordinates) return errorResponse(400, messages.error.COORDINATES_REQ, {})
    const [userLatitude, userLongitude] = userCoordinates.split(',').map(parseFloat);

    const salons = await SalonModel.find({ salon_city: city }).select("-_id -__v -salon_username -salon_password -salon_owner_pancard_number -salon_bank_name -salon_bank_account_number -salon_bank_IFSC_code -createdAt -updatedAt");
    const salonsWithDistance = [];

    // Calculate distances for each salon
    for (let i = 0; i < salons.length; i++) {
        const salonLatitude = parseFloat(salons[i].salon_location.coordinates[0]);
        const salonLongitude = parseFloat(salons[i].salon_location.coordinates[1]);

        const distance = calculateDistance(userLatitude, userLongitude, salonLatitude, salonLongitude);
        const salonWithDistance = {
            ...salons[i].toObject(),
            distance: distance,
        };
        salonsWithDistance.push(salonWithDistance);
    }
    salonsWithDistance.sort((a, b) => a.distance - b.distance);
    return successResponse(200, messages.success.SUCCESS, { salons: salonsWithDistance });
}

const salonByUuid = async (req) => {
    const salonUuid = req.query.uuid
    if(!salonUuid) return errorResponse(400, messages.error.UUID_REQUIRED, {})
    const salon = await SalonModel.findOne({salon_uuid: salonUuid}).select("-_id -__v -salon_username -salon_password -salon_owner_pancard_number -salon_bank_name -salon_bank_account_number -salon_bank_IFSC_code -createdAt -updatedAt")
    if(!salon) return errorResponse(404, messages.error.NOT_FOUND, {})
    return successResponse(200, messages.success.SUCCESS, {salon: salon})
}
module.exports = { salonsByCity, salonByUuid }