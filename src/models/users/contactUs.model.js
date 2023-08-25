const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// Login contact Schema
const contactSchema = new schema({
    contact_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    contact_name: {
        type: String,
        required: true,
    },
    contact_email: {
        type: String,
        required: true,
    },
    contact_message: {
        type: String,
        required: true,
    }
   
},{ timestamps: true })

// End of the modal

module.exports = mongoose.model("contact", contactSchema, "contacts");