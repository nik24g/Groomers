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
    appointment_booking_id: {
        type: String,
        required: true,
        unique: true,
    },
    appointment_user_uuid: {
        type: String,
        required: true
    },
    appointment_salon_uuid: {
        type: String,
        required: true
    },
    appointment_user_full_name: {
        type: String,
        required: true
    },
    appointment_user_phone: {
        type: String,
    },
    appointment_slot_uuids: [
        {
            type: String,
            required: true
        }
    ],
    appointment_duration: {
        type: String,
        required: true
    },
    appointment_timing: {
        type: String,
        required: true
    },
    appointment_services: [
        {
            service_name: {
                type: String,
                required: true
            },
            service_discount: {
                type: String
            },
            service_original_price: {
                type: String,
                required: true
            },
            service_duration: {
                type: String,
                required: true
            }
        }
    ],
    appointment_combos: [
        {   
            combo_name: {
                type: String,
                required: true
            },
            combo_services_name: [
                {
                    type: String,
                    required: true
                }
            ],
            combo_price: {
                type: String,
                required: true
            },
            combo_duration: {
                type: String,
                required: true
            }
        }
    ],
    appointment_date: {
        type: String,
        required: true
    },
    appointment_payment_status: {
        type: String,
        required: true
    },
    appointment_is_payment_done: {
        type: Boolean,
        default: false
    },
    appointment_payment_method: {
        type: String
    },
    appointment_is_guest: {
        type: Boolean,
        default: false
    },
    appointment_status: {
        type: String,
        required: true
    },
    appointment_is_active: {
        type: Boolean,
        default: false
    },
    appointment_original_price: {
        type: String,
        required: true
    },
    appointment_discounted_price: {
        type: String,
        required: true
    },
    appointment_subtotal: {
        type: String,
        required: true
    },
    appointment_is_reappointment: {
        type: Boolean,
        default: false
    },
    appointment_previous_appointment_uuid: {
        type: String
    },
    appointment_invoice_path: {
        type: String
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("appointment", appointmentSchema, "appointments");