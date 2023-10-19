const AppointmentModel = require("../../models/client/appointment.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const moment = require("moment");

const appointments = async (req) => {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const filter = {
        appointment_salon_uuid: req.uuid
    }
    // adding status filter 
    if (status){
        filter.appointment_status = status
    }
    // adding date range filter 
    if (startDate && endDate) {
        // Parse the date input if needed, assuming it's already in "DD/MM/YYYY" format
        const parsedStartDate = startDate;
        const parsedEndDate = endDate;

        filter.appointment_date = {
            $gte: parsedStartDate,
            $lte: parsedEndDate,
        };
    }
    // Count total appointments
    const totalAppointments = await AppointmentModel.countDocuments(filter);

    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        select: {
            _id: 0,
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
            appointment_is_reappointment: 0,
        },
        sort: { createdAt: -1 }
    };

    const appointments = await AppointmentModel.find(filter, null, options);
    return successResponse(200, messages.success.SUCCESS, {appointments, totalAppointments})
}

const markCompleteAppointment = async (req) => {
    const appointmentUuid = req.body.appointment_uuid
    const appointment = await AppointmentModel.findOne({appointment_uuid: appointmentUuid, appointment_status: "booked"})
    if (!appointment) return errorResponse(400, messages.error.CAN_NOT_PERFORM_TASK, {})
    appointment.appointment_status = "completed"
    appointment.appointment_is_active = false
    await appointment.save()
    return successResponse(200, messages.success.SUCCESS, {})

}

module.exports = {appointments, markCompleteAppointment}