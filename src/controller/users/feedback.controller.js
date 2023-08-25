const FeedbackModel = require("../../models/client/feedback.model")
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")

const createFeedback = async (req) =>  {
    const salonUuid = req.body.salon_uuid
    const orderUuid = req.body.order_uuid
    const serviceOrComboName = req.body.service_or_combo_name
    const rating = req.body.rating
    const message = req.body.message
    const today = moment
    
    const feedback = new FeedbackModel({
        feedback_uuid: uuidv4(),
        feedback_user_uuid: req.uuid,
        feedback_salon_uuid: salonUuid,
        feedback_order_uuid: orderUuid,
        feedback_service_or_combo_name: serviceOrComboName,
        feedback_rating: rating,
        feedback_message: message,
        feedback_date: today().format("DD/MM/YYYY")
    })
    const response = await feedback.save()
    return successResponse(201, messages.success.SUCCESS, {response})
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