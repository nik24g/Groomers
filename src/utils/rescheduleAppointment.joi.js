const Joi = require("joi");

// Custom validation function to check the time format
function validateTime(time) {
  if (!/^([1-9]|1[0-2]):[0-5][0-9] (am|pm)$/i.test(time)) {
    throw new Error('Invalid time format. Use "h:mm a" format (e.g., "9:00 am").');
  }
  return time;
}


const validation = Joi.object({
  appointment_uuid: Joi.string().length(36).required(),
  slot_uuid: Joi.string().length(36).required(),
  timing: Joi.string().custom(validateTime).required(),
  date: Joi.string().pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/).required(), // DD/MM/YYYY format
})

module.exports = validation;
//developed by Nitin Goswami