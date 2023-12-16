const homeServiceModel = require("../../models/users/homeService.model.js");
const messages = require("../../utils/constant.js");
const { sendConfirmationEmail } = require("../../services/email.service.js");
const { v4: uuidv4 } = require("uuid");

const homeService = async (req) => {
  try {
    const newHomeService = new homeServiceModel({
      targetGender: req.body.targetGender,
      selectedServices: req.body.selectedServices,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      fullName: req.body.fullName,
      mobileNumber: req.body.mobileNumber,
      fullAddress: req.body.fullAddress,
      suggestions: req.body.suggestions,
    });
    await newHomeService.save();
    await sendConfirmationEmail(
      req.email,
      messages.subject.APPOINTMENT_BOOKED,
      // "<h1>your appointment is booked</h1>"
      `Hi ${req.body.fullName} your appointment is successfully booked for ${req.body.appointmentTime} on ${req.body.appointmentDate} . Thank You !`
    );
    await sendConfirmationEmail(
      "shanupl542011@gmail.com",
      messages.subject.APPOINTMENT_BOOKED,
      `Home service appointment is booked by <br><br> Fullname :- ${req.body.fullName} <br>Appointment date :- ${req.body.appointmentDate} <br> Appointment time :- ${req.body.appointmentTime} <br> Selected services :- ${req.body.selectedServices} <br> Full address :- ${req.body.fullAddress} <br> Mobile number :- ${req.body.mobileNumber} <br> Gender :- ${req.body.targetGender}<br> Suggestions :- ${req.body.suggestions}. <br> Thank You !`
    );
    return { details: newHomeService, user: req.email };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = homeService;
