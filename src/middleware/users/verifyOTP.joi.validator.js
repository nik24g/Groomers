const validation = require("../../utils/verifyOtp.joi")
const { successResponse, errorResponse } = require("../../utils/response");

const verifyOtp = async (req, res, next) => {
	const payload = {
		email: req.body.email,
		otp: req.body.otp,
	};

	const { error } = validation.validate(payload);
	if (error) {
		return res.send(errorResponse(406, error.details[0].message, {}));
	} else {
		next();
	}
};
module.exports = verifyOtp;