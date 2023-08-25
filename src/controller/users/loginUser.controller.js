const UserModel = require("../../models/users/user.model")
const OtpModel = require("../../models/users/otp.model")
const jwt = require("jsonwebtoken")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");


const userLogin = async (req) => {
    let enteredEmail = req.body.email.trim().toLowerCase()
    let enteredOtp = req.body.otp.trim()
    let user = await UserModel.findOne({ user_email: enteredEmail })
    let otpData = await OtpModel.findOne({ otp_user_uuid: user.user_uuid })
    let token;
    if(!user) return errorResponse(404, messages.error.USER_NOT_FOUND, {})
    if(!otpData) return errorResponse(406, messages.error.NO_OTP, {})
    if (otpData.otp_expireAt < Date.now()) {
        return successResponse(205, messages.success.OTP_EXPIRED, {})
    } 
    else { 
        // if not expired then check whether the otp is same or not 
        if (otpData.otp_count < 3) {
            if (enteredOtp == otpData.otp_number) { 
                // verify otp and generate token to log in 
                let payload = { email: user.user_email, fullName: user.user_full_name, mobile: user.user_mobile, uuid: user.user_uuid }
                token = jwt.sign(payload, process.env.USER_ACCESS_TOKEN_SECRET, { expiresIn: '60d' })
                await OtpModel.findOneAndDelete({otp_uuid: otpData.otp_uuid});
                return {code: 200, message: messages.success.LOGGED_IN, data: {token: token}}
            }
            else {
                if (otpData.otp_count == 2) {
                    otpData.otp_count += 1
                    otpData.otp_timeOutTime = Date.now() + 120000
                    await otpData.save()
                } else {
                    otpData.otp_count += 1
                    await otpData.save()
                }
                return errorResponse(400, messages.success.INVALID_OTP, {})
            }
        }
        else {
            // user reached wrong otp limit 
            return errorResponse(400, messages.success.OTP_LIMIT, {})
        }
    }
}
module.exports = userLogin