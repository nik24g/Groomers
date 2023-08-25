const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// Login Otp Schema
const slotSchema = new schema({
    slot_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    slot_salon_uuid: {
        type: String,
        required: true,
    },
    slot_time: {
        type: String,
    },
    slot_date: {
        type: String,
        required: true
    },
    slot_count: {
        type: String,
        required: true
    },
    slot_status: {
        type: String,
        default: "available"
    },
    slot_isActive: {
        type: Boolean,
        default: true
    },
    slot_isExpire: {
        type: Boolean,
        default: false
    },
   
},{ timestamps: true })

// End of the modal

module.exports = mongoose.model("Slot", slotSchema, "Slots");