const mongoose = require("mongoose")
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const feedbackSchema = new schema({
    feedback_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    feedback_user_uuid: {
        type: String,
        required: true
    },
    feedback_salon_uuid: {
        type: String,
        required: true
    },
    feedback_order_uuid: {
        type: String,
        required: true
    },
    feedback_service_or_combo_name: {
        type: String,
        required: true
    },
    feedback_rating: {
        type: String,
        required: true
    },
    feedback_message: {
        type: String,
        required: true
    },
    feedback_date: {
        type: String,
        required: true
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("feedback", feedbackSchema, "feedbacks");