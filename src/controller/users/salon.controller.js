const SalonModel = require('../../models/client/salon.model')
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { calculateDistance, calculateDistanceByMap } = require("../../services/geoLocation")
const FeedbackModel = require('../../models/client/feedback.model')
const WishListModel = require('../../models/users/wishlist.model')
const AppointmentModel = require("../../models/client/appointment.model")

const salonsByCity = async (req) => {
    const city = req.query.city;
    const userCoordinates = req.query.location;
    if (!city) return errorResponse(400, messages.error.CITY_NAME_REQ, {});
    if (!userCoordinates) return errorResponse(400, messages.error.COORDINATES_REQ, {});
    const [userLatitude, userLongitude] = userCoordinates.split(',').map(parseFloat);
  
    const salons = await SalonModel.find({ salon_city: city }).select("-_id -__v -salon_username -salon_password -salon_owner_pancard_number -salon_bank_name -salon_bank_account_number -salon_bank_IFSC_code -createdAt -updatedAt");
  
    const salonsWithRatingsAndDistance = [];
  
    for (let i = 0; i < salons.length; i++) {
      const salonLatitude = parseFloat(salons[i].salon_location.coordinates[0]);
      const salonLongitude = parseFloat(salons[i].salon_location.coordinates[1]);
  
      // Calculate distances for each salon
      const distance = calculateDistance(userLatitude, userLongitude, salonLatitude, salonLongitude);
      // const mapDistance = await calculateDistanceByMap(userLatitude, userLongitude, salonLatitude, salonLongitude)
  
      // Fetch and calculate ratings for each salon
      const feedbacks = await FeedbackModel.find({ feedback_salon_uuid: salons[i].salon_uuid });
      let rating = 0;
  
      if (feedbacks.length > 0) {
        const totalRating = feedbacks.reduce((sum, feedback) => sum + parseInt(feedback.feedback_rating), 0);
        rating = totalRating / feedbacks.length;
      }
  
      const salonWithRatingsAndDistance = {
        ...salons[i].toObject(),
        distance: distance,
        // mapDistance: mapDistance,
        rating: rating,
      };
      salonsWithRatingsAndDistance.push(salonWithRatingsAndDistance);
    }
  
    // Sort salons by distance
    salonsWithRatingsAndDistance.sort((a, b) => a.distance - b.distance);
    return successResponse(200, messages.success.SUCCESS, { salons: salonsWithRatingsAndDistance });
  };
  

const salonByUuid = async (req) => {
    const salonUuid = req.query.uuid
    const userUuid = req.query.userUuid
    let isWishlisted = false
    if(!salonUuid) return errorResponse(400, messages.error.UUID_REQUIRED, {})
    const salon = await SalonModel.findOne({salon_uuid: salonUuid}).select("-_id -__v -salon_username -salon_password -salon_owner_pancard_number -salon_bank_name -salon_bank_account_number -salon_bank_IFSC_code -createdAt -updatedAt")
    if(!salon) return errorResponse(404, messages.error.NOT_FOUND, {})

    // now we will check is this salon is added in users wishlist or not
    const wishlist = await WishListModel.findOne({wishlist_salon_uuid: salonUuid, wishlist_user_uuid: userUuid})
    if(wishlist){
      isWishlisted = true
    }

    // now we will check if user able to give rating to the salon or not
    let ableToRating = false
    const appointmentsCount = await AppointmentModel.countDocuments({appointment_user_uuid: userUuid, appointment_salon_uuid: salonUuid, appointment_status: "completed"})
    const existingFeedbacksCount = await FeedbackModel.countDocuments({feedback_user_uuid: userUuid, feedback_salon_uuid: salonUuid})
    if(appointmentsCount > existingFeedbacksCount){
        ableToRating = true
    }
    return successResponse(200, messages.success.SUCCESS, {salon: salon, isWishlisted: isWishlisted, ableToRating: ableToRating})
}
module.exports = { salonsByCity, salonByUuid }