const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// payment Schema
const paymentSchema = new schema({
    payment_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    payment_user_uuid: {
        type: String,
        required: true,
    },
    payment_salon_uuid: {
        type: String,
        required: true,
    },
    payment_merchant_transaction_id: {
        type: String,
        required: true,
    },
    payment_transaction_id: {
        type: String
    },
    payment_amount: {
        type: Number,
        required: true,
    },
    payment_status: {
        type: String,
        required: true,
    },
    payment_code: {
        type: String,
        required: true
    },
    payment_options: {
        type: String
    }
}, { timestamps: true })

// End of the modal

module.exports = mongoose.model("payment", paymentSchema, "payments");