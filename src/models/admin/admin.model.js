const mongoose = require("mongoose")
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const adminSchema = new schema({
    admin_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    admin_username: {
        type: String,
        required: true,
        unique: true,
    },
    admin_email: {
        type: String,
        default: null,
        unique: true,
    },
    admin_password: {
        type: String,
        required: true,
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("admin", adminSchema, "admins");