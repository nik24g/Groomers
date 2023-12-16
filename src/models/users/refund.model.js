const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// refund Schema
const refundSchema = new schema({
    refund_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    refund_user_uuid: {
        type: String,
        required: true,
    },
    refund_salon_uuid: {
        type: String,
        required: true,
    },
    refund_merchant_transaction_id: {
        type: String,
        required: true,
    },
    refund_transaction_id: {
        type: String
    },
    refund_amount: {
        type: Number,
        required: true,
    },
    refund_status: {
        type: String,
        required: true,
    },
    refund_code: {
        type: String,
        required: true
    },
    refund_options: {
        type: String
    }
}, { timestamps: true })

// End of the modal

module.exports = mongoose.model("refund", refundSchema, "refunds");
//developed by Nitin Goswami