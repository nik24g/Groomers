const validation = require("../../utils/generateOtp.joi")
const { successResponse, errorResponse } = require("../../utils/response");

const otpGenerateValidation = async (req, res, next) => {
	const payload = {
		email: req.body.email
	};
    
	const { error } = validation.validate(payload);
	if (error) {
		return res.send(errorResponse(406, error.details[0].message, {}));
	} else {
		next();
	}
};
module.exports = otpGenerateValidation;