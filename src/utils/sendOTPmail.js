const nodemailer = require('nodemailer');
const Otpmodel = require('../models/users/otp.model');
const otpgenerator = require('otp-generator')
const sendotpmail = async (user) => {
    var transporter = nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE,
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        }
    });

    const otp = otpgenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })

    let existingOtp = await Otpmodel.findOne({ otp_user_uuid: user.user_uuid })
    if (existingOtp) {
        if (existingOtp.otp_timeOutTime) {
            if (existingOtp.otp_timeOutTime > Date.now()) {
                // logic for showing him timeout
                let waitingTime = (existingOtp.otp_timeOutTime - Date.now()) / (1000 * 60)
                return `Please wait for ${waitingTime} minutes`
            } else {
                // updating existing otp when timeout is now cool down
                existingOtp.otp_number = otp
                existingOtp.otp_expireAt = Date.now() + 180000
                existingOtp.otp_count = 0
                existingOtp.otp_timeOutTime = null
                await existingOtp.save()
            }
        } else {
            // updating existing otp when no timeout is there
            existingOtp.otp_number = otp
            existingOtp.otp_expireAt = Date.now() + 180000
            existingOtp.otp_count = 0
            await existingOtp.save()
        }
    } else {
        // creating new otp
        const newOtp = new Otpmodel({ otp_number: otp, otp_user_uuid: user.user_uuid, otp_expireAt: Date.now() + 180000, otp_count: 0 });
        await newOtp.save();
    }
    const mailoption = {
        from: process.env.NODEMAILER_USER,
        to: user.user_email,
        subject: 'OTP for verification',
        html: `<h2>Your One Time Password is :  </h2>
        <h3> <b>${otp}</b>  </h3>
        <p>The otp will expire in <b>3 minutes</b></p>`
    }
    let result = await transporter.sendMail(mailoption);
    return {};
}

module.exports = sendotpmail
