const User = require('../../models/users/user.model')
const sendotpmail = require('../../utils/sendOTPmail')
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const otpGenerate = async (req, res) => {
    let userEmail = req.body.email.trim().toLowerCase()
    let user = await User.findOne({ user_email: userEmail })
    let response;
    if (!user) {
        return successResponse(404, messages.success.NO_USER_FOUND, {});
    } else {
        response = await sendotpmail(user);
        return successResponse(200, messages.success.OTP_CREATED, response);
    }
}

module.exports = otpGenerate   