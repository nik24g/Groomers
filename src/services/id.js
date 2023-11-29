const AppointmentModel = require("../models/client/appointment.model");

function generateRandomID(length) {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomID = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomID += characters.charAt(randomIndex);
  }
  return randomID;
}

const bookingId = async () => {
    while (true) {
        const id = generateRandomID(6);
        const appointment = await AppointmentModel.findOne({ appointment_booking_id: id });
        if (!appointment) return id;
    }
}

module.exports = { bookingId };
//developed by Nitin Goswami
