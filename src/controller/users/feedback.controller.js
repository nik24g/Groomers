const FeedbackModel = require("../../models/client/feedback.model")
const AppointmentModel = require("../../models/client/appointment.model")
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")

// user can give rating to salon if he had a service in the salon. if user didn't have any service in the salon then he will not able to give the rating
// also the number of rating that user can give will be depend on the number of appointments he had in the salon 
// before creating rating or feedback we need to validate the number of appointment of the user in that salon with the number of ration he has given to that salon
const createFeedback = async (req) =>  {
    const salonUuid = req.body.salon_uuid
    const rating = req.body.rating
    const message = req.body.message
    const today = moment
    const appointmentsCount = await AppointmentModel.countDocuments({appointment_user_uuid: req.uuid, appointment_salon_uuid: salonUuid, appointment_status: "completed"})
    const existingFeedbacksCount = await FeedbackModel.countDocuments({feedback_user_uuid: req.uuid, feedback_salon_uuid: salonUuid})
    // here we are checking the numbers of booking and existed feedback for the perticuler salon 
    if(appointmentsCount > existingFeedbacksCount){
        const feedback = new FeedbackModel({
            feedback_uuid: uuidv4(),
            feedback_user_uuid: req.uuid,
            feedback_salon_uuid: salonUuid,
            feedback_rating: rating,
            feedback_message: message,
            feedback_date: today().format("DD/MM/YYYY")
        })
        const response = await feedback.save()
        return successResponse(201, messages.success.SUCCESS, {response})
    }
    else {
        return errorResponse(400, messages.error.CAN_NOT_GIVE_FEEDBACK, {})
    }
}

const getFeedback = async (req) => {
    let feedbacks;
    const salonUuid = req.query.salon_uuid
    const rating = req.query.rating
    if(rating && salonUuid){
        feedbacks = await FeedbackModel.find({feedback_user_uuid: req.uuid, feedback_rating: rating, feedback_salon_uuid: salonUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    if(salonUuid){
        feedbacks = await FeedbackModel.find({feedback_user_uuid: req.uuid, feedback_salon_uuid: salonUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    if(rating){
        feedbacks = await FeedbackModel.find({feedback_user_uuid: req.uuid, feedback_rating: rating})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
}

module.exports = {createFeedback, getFeedback}