const FeedbackModel = require("../../models/client/feedback.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")

const getFeedback = async (req) => {
    let feedbacks;
    const salonUuid = req.uuid
    const rating = req.query.rating
    if(rating){
        feedbacks = await FeedbackModel.find({feedback_rating: rating, feedback_salon_uuid: salonUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    else{
        feedbacks = await FeedbackModel.find({feedback_salon_uuid: salonUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
}

module.exports = {getFeedback}