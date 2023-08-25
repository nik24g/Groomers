const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// Login home Schema
const homeSchema = new schema({
    home_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    home_email: {
        type: String,
        required: true,
    },
    home_mobile: {
        type: String,
        required: true,
    }
   
},{ timestamps: true })

// End of the modal

module.exports = mongoose.model("home", homeSchema, "homes");