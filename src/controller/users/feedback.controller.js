const FeedbackModel = require("../../models/client/feedback.model")
const AppointmentModel = require("../../models/client/appointment.model")
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")

// user can give rating to salon if he had a service in the salon. if user didn't have any service in the salon then he will not able to give the rating
// also the number of rating that user can give will be depend on the number of appointments he had in the salon 
// before creating rating or feedback we need to validate the number of appointment of the user in that salon with the number of ration he has given to that salon
const createFeedback = async (req) => {
    const salonUuid = req.body.salon_uuid
    const rating = req.body.rating
    const message = req.body.message
    const today = moment
    const appointmentsCount = await AppointmentModel.countDocuments({ appointment_user_uuid: req.uuid, appointment_salon_uuid: salonUuid, appointment_status: "completed" })
    const existingFeedbacksCount = await FeedbackModel.countDocuments({ feedback_user_uuid: req.uuid, feedback_salon_uuid: salonUuid })
    // here we are checking the numbers of booking and existed feedback for the perticuler salon 
    if (appointmentsCount > existingFeedbacksCount) {
        const feedback = new FeedbackModel({
            feedback_uuid: uuidv4(),
            feedback_user_uuid: req.uuid,
            feedback_salon_uuid: salonUuid,
            feedback_rating: rating,
            feedback_message: message,
            feedback_date: today().format("DD/MM/YYYY")
        })
        const response = await feedback.save()
        return successResponse(201, messages.success.SUCCESS, { response })
    }
    else {
        return errorResponse(400, messages.error.CAN_NOT_GIVE_FEEDBACK, {})
    }
}

const getFeedback = async (req) => {
    const salonUuid = req.query.salon_uuid;
    const rating = req.query.rating;

    let pipeline = [];

    if (salonUuid) {
        pipeline.push({ $match: { feedback_salon_uuid: salonUuid } });
    }
    else{
        return errorResponse(400, messages.error.SALON_UUID_REQUIRED, {})
    }
    if (rating) {
        pipeline.push({ $match: { feedback_rating: rating } });
    }

    pipeline.push({
        $lookup: {
            from: 'users',  // The name of the 'users' collection
            localField: 'feedback_user_uuid',
            foreignField: 'user_uuid',
            as: 'user'
        }
    });

    // Project only the desired fields and get the first element from the 'user' array
    pipeline.push({
        $project: {
            _id: 0,  // Exclude the default _id field
            feedback_uuid: 1,
            feedback_rating: 1,
            feedback_message: 1,
            feedback_date: 1,
            user_full_name: { $arrayElemAt: ['$user.user_full_name', 0] }  // Extract the first element from the 'user' array
        }
    });

    const feedbacks = await FeedbackModel.aggregate(pipeline);

    return successResponse(200, messages.success.SUCCESS, feedbacks);
};





module.exports = { createFeedback, getFeedback }
//developed by Nitin Goswami