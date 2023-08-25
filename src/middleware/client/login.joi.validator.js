const validation = require("../../utils/admin/login.joi")
const { successResponse, errorResponse } = require("../../utils/response");

const loginValidation = async (req, res, next) => {
	const payload = {
		username: req.body.username,
		password: req.body.password,
	};

	const { error } = validation.validate(payload);
	if (error) {
		return res.send(errorResponse(406, error.details[0].message, {}));
	} else {
		next();
	}
};
module.exports = loginValidation;