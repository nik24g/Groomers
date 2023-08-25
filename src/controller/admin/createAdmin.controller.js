const adminModel = require("../../models/admin/admin.model");
const messages = require("../../utils/constant.js");
const bcrypt = require('bcryptjs');

const register = async (req) => {
    const admin = await adminModel.findOne({
        admin_username: req.body.username,
    });
    // checking user is already registered or not
    if (admin) {
        throw messages.error.ALREADY_ADMIN;
    }
    else {
        const password = req.body.password.trim()
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const user = new adminModel({
            admin_username: req.body.username.trim(),
            admin_email: req.body.email,
            admin_password: hashedPassword
        });
        const newAdmin = await user.save();
        return newAdmin;
    }
};
module.exports = register;