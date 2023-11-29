const AppointmentModel = require("../../models/client/appointment.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const completeAppointments = async (req) => {
    await AppointmentModel.updateMany({appointment_status: "booked"}, {appointment_status: "completed", 
    appointment_is_active: false})
    return successResponse(200, messages.success.SUCCESS, {})
}

module.exports = {completeAppointments}
//developed by Nitin Goswami