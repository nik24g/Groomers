const SalonModel = require('../../models/client/salon.model')
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { calculateDistance, calculateDistanceByMap } = require("../../services/geoLocation")
const FeedbackModel = require('../../models/client/feedback.model')
const WishListModel = require('../../models/users/wishlist.model')
const AppointmentModel = require("../../models/client/appointment.model")

const salonsByCity = async (req) => {
  const city = req.query.city || process.env.DEFAULT_CITY;
  const userCoordinates = req.query.location;
  const minServicePrice = req.query.minServicePrice;
  const maxServicePrice = req.query.maxServicePrice;
  const minComboPrice = req.query.minComboPrice;
  const maxComboPrice = req.query.maxComboPrice;
  const sex = req.query.sex
  const minRating = parseFloat(req.query.minRating);
  const area = req.query.area
  const serviceString = req.query.service
  const distance = parseFloat(req.query.distance)

  if (!city) return errorResponse(400, messages.error.CITY_NAME_REQ, {});
  // if (!userCoordinates) return errorResponse(400, messages.error.COORDINATES_REQ, {});

  const aggregationStages = [
    {
      $match: {
        salon_city: city,
      },
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        salon_username: 0,
        salon_password: 0,
        salon_owner_pancard_number: 0,
        salon_bank_name: 0,
        salon_bank_account_number: 0,
        salon_bank_IFSC_code: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    },
  ];
  // area filter 
  if (area) {
    aggregationStages.push({
      $match: {
        salon_area: area
      },
    });
  }
  // Conditionally add $match stages based on the presence of filter values
  if (minServicePrice !== undefined && maxServicePrice !== undefined) {
    aggregationStages.push({
      $match: {
        'salon_services.service_discount': {
          $gte: parseFloat(minServicePrice),
          $lte: parseFloat(maxServicePrice),
        },
      },
    });
  }
  if (minComboPrice !== undefined && maxComboPrice !== undefined) {
    aggregationStages.push({
      $match: {
        'salon_combo_services.combo_price': {
          $gte: parseFloat(minComboPrice),
          $lte: parseFloat(maxComboPrice),
        },
      },
    });
  }

  // salon type filter 
  if (sex !== undefined) {
    aggregationStages.push({
      $match: {
        'salon_type': sex
      },
    });
  }
  // service name filter 
if (serviceString) {
  const services = serviceString.split(",");
  aggregationStages.push({
    $match: {
      'salon_services.service_name': {
        $all: services
      }
    },
  });
}
  let salons = await SalonModel.aggregate(aggregationStages);

  const salonsWithRatingsAndDistance = [];

  for (let i = 0; i < salons.length; i++) {
    let distance;
    if(userCoordinates){
      const [userLatitude, userLongitude] = userCoordinates.split(',').map(parseFloat);
      const salonLatitude = parseFloat(salons[i].salon_location.coordinates[0]);
      const salonLongitude = parseFloat(salons[i].salon_location.coordinates[1]);

      // Calculate distances for each salon
      distance = calculateDistance(userLatitude, userLongitude, salonLatitude, salonLongitude);
    }

    // Fetch and calculate ratings for each salon
    const feedbacks = await FeedbackModel.find({ feedback_salon_uuid: salons[i].salon_uuid });
    let rating = 0;
    const totalFeedback = feedbacks.length
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum, feedback) => sum + parseInt(feedback.feedback_rating), 0);
      rating = totalRating / feedbacks.length;
    }

    const salonWithRatingsAndDistance = {
      ...salons[i], // This includes all fields from the salon object
      rating: rating,
      totalFeedback: totalFeedback
    };
    if(distance){
      salonWithRatingsAndDistance.distance = distance
    }
    salonsWithRatingsAndDistance.push(salonWithRatingsAndDistance);
  }

  // Sort salons by distance
  salonsWithRatingsAndDistance.sort((a, b) => a.distance - b.distance);

  salons = salonsWithRatingsAndDistance // updating salons list

  // logic for filter with rating 
  // there will be min rating and we have to show all the salons which will be equal or more than min rating and rest of the salons will show in lower in list 
  if (minRating) {
    const highRatingSalons = []
    const lowerRatingSalons = []
    for (const salon of salons) {
      if (salon.rating < minRating) {
        lowerRatingSalons.push(salon)
      }
      else {
        highRatingSalons.push(salon)
      }
    }
    // Sort arrays by rating
    highRatingSalons.sort((a, b) => b.rating - a.rating);
    lowerRatingSalons.sort((a, b) => b.rating - a.rating);
    salons = highRatingSalons.concat(lowerRatingSalons);
  }
  // distance filter 
  if (distance) {
    const salonsInRange = []
    for (const salon of salons) {
      if (salon.distance <= distance) {
        salonsInRange.push(salon)
      }
    }
    salons = salonsInRange;
  }
  return successResponse(200, messages.success.SUCCESS, { salons: salons });
};




const salonByUuid = async (req) => {
  const salonUuid = req.query.uuid
  const userUuid = req.query.userUuid
  let isWishlisted = false
  if (!salonUuid) return errorResponse(400, messages.error.UUID_REQUIRED, {})
  const salon = await SalonModel.findOne({ salon_uuid: salonUuid }).select("-_id -__v -salon_username -salon_password -salon_owner_pancard_number -salon_bank_name -salon_bank_account_number -salon_bank_IFSC_code -createdAt -updatedAt")
  if (!salon) return errorResponse(404, messages.error.NOT_FOUND, {})

  // now we will check is this salon is added in users wishlist or not
  const wishlist = await WishListModel.findOne({ wishlist_salon_uuid: salonUuid, wishlist_user_uuid: userUuid })
  if (wishlist) {
    isWishlisted = true
  }

  // now we will check if user able to give rating to the salon or not
  let ableToRating = false
  const appointmentsCount = await AppointmentModel.countDocuments({ appointment_user_uuid: userUuid, appointment_salon_uuid: salonUuid, appointment_status: "completed" })
  const existingFeedbacksCount = await FeedbackModel.countDocuments({ feedback_user_uuid: userUuid, feedback_salon_uuid: salonUuid })
  if (appointmentsCount > existingFeedbacksCount) {
    ableToRating = true
  }
  return successResponse(200, messages.success.SUCCESS, { salon: salon, isWishlisted: isWishlisted, ableToRating: ableToRating })
}
module.exports = { salonsByCity, salonByUuid }