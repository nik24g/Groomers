const validation = require("../../utils/client/appointmentStatus.joi")
const { successResponse, errorResponse } = require("../../utils/response");
const AppointmentModel = require("../../models/client/appointment.model")
const messages = require("../../utils/constant")

const statusChangeValidation = async (req, res, next) => {
	const payload = {
		appointment_uuid: req.body.appointment_uuid,
	};
	const { error } = validation.validate(payload);
	if (error) {
		return res.send(errorResponse(406, error.details[0].message, {}));
	} else {
        // checking that the appointment is belongs to that client or any another client 
        const appointment = await AppointmentModel.findOne({appointment_uuid: req.body.appointment_uuid})
        if (appointment.appointment_salon_uuid != req.uuid){
            return res.status(403).json(errorResponse(403, messages.error.CAN_NOT_PERFORM_TASK, {}))
        }
		next();
	}
};
module.exports = statusChangeValidation;