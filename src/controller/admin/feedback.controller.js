const FeedbackModel = require("../../models/client/feedback.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")

// salon, user, rating
const getFeedback = async (req) => {
    let feedbacks;
    const salonUuid = req.query.salon_uuid
    const rating = req.query.rating
    const userUuid = req.query.user_uuid
    const feedbackUuid = req.query.feedback_uuid
    if(feedbackUuid){
        feedbacks = await FeedbackModel.find({feedback_uuid: feedbackUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    if(rating && salonUuid){
        feedbacks = await FeedbackModel.find({feedback_rating: rating, feedback_salon_uuid: salonUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    else if(rating){
        feedbacks = await FeedbackModel.find({feedback_rating: rating})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    else if(salonUuid){
        feedbacks = await FeedbackModel.find({feedback_salon_uuid: salonUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    else if(userUuid){
        feedbacks = await FeedbackModel.find({feedback_user_uuid: userUuid})
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
    else{
        feedbacks = await FeedbackModel.find()
        return successResponse(200, messages.success.SUCCESS, feedbacks)
    }
}
const deleteFeedback = async (req) => {
    const feedbackUuid = req.body.feedback_uuid
    const feedback = await FeedbackModel.findOne({feedback_uuid: feedbackUuid})
    if (feedback){
        await FeedbackModel.findOneAndDelete({feedback_uuid: feedbackUuid})
        return successResponse(203, messages.success.DELETED, {})
    }
    else{
        return errorResponse(404, messages.error.NOT_FOUND, {})
    }
}

module.exports = {getFeedback, deleteFeedback}