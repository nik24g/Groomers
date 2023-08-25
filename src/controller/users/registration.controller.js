const userModel = require("../../models/users/user.model");
const messages = require("../../utils/constant.js");

const register = async (req) => {
    const user = await userModel.findOne({
        user_email: req.body.email,
    });
    // checking user is already registered or not
    if (user) {
        throw messages.error.ALREADY_USER;
    }
    else {
        const user = new userModel({
            user_full_name: req.body.full_name.trim(),
            user_email: req.body.email.trim().toLowerCase(),
            user_mobile: req.body.mobile.trim().toLowerCase(),
        });
        const newUser = await user.save();
        return newUser;
    }
};
module.exports = register;