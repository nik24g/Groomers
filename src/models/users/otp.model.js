const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// Login Otp Schema
const otpSchema = new schema({
    otp_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    otp_number: {
        type: String,
        required: true,
    },
    otp_user_uuid: {
        type: String,
        required: true,
        unique: true
    },
    otp_count: {
        type: Number,
        default: 0
    },
    otp_timeOutTime: {
        type: Date,
        default: null
    },
    otp_expireAt: {
        type: Date,
        required: true
    }
   
},{ timestamps: true })

// End of the modal

module.exports = mongoose.model("Otp", otpSchema, "OTPs");