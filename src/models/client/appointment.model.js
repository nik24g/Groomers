const mongoose = require("mongoose")
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const appointmentSchema = new schema({
    appointment_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    appointment_user_uuid: {
        type: String,
        required: true
    },
    appointment_salon_uuid: {
        type: String,
        required: true
    },
    appointment_order_uuid: {
        type: String,
        required: true
    },
    appointment_service_or_combo_name: {
        type: String,
        required: true
    },
    appointment_date: {
        type: String,
        required: true
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("appointment", appointmentSchema, "appointments");