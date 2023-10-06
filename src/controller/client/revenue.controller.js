const AppointmentModel = require("../../models/client/appointment.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const moment = require("moment");

const revenue = async (req) => {
    const { startDate, endDate } = req.query;
    const filter = {
        appointment_salon_uuid: req.uuid
    }
    // adding status filter
    filter.appointment_status = "completed"
    // adding date range filter 
    if (startDate && endDate) {
        const parsedStartDate = startDate;
        const parsedEndDate = endDate;
        filter.appointment_date = {
            $gte: parsedStartDate,
            $lte: parsedEndDate,
        };
    }
    const appointments = await AppointmentModel.find(filter);
    let totalRevenue = 0
    for (const booking of appointments) {
        totalRevenue += parseFloat(booking.appointment_subtotal)
    }
    return successResponse(200, messages.success.SUCCESS, {revenue: totalRevenue, totalAppointments: appointments.length})
}

module.exports = {revenue}