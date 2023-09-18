const Joi = require("joi");

// Custom validation function to check the time format
function validateTime(time) {
  if (!/^([1-9]|1[0-2]):[0-5][0-9] (am|pm)$/i.test(time)) {
    throw new Error('Invalid time format. Use "h:mm a" format (e.g., "9:00 am").');
  }
  return time;
}

// Custom validation function to calculate required length of slot_uuids array
function calculateSlotUuidsLength(value, helpers) {
  const duration = value.duration;
  const requiredLength = Math.ceil(duration / 15);

  if (value.slot_uuids.length !== requiredLength) {
    return helpers.message(`The 'slot_uuids' array length should be ${requiredLength}.`);
  }

  return value;
}

const validation = Joi.object({
  salon_uuid: Joi.string().length(36).required(),
  slot_uuids: Joi.array().items(Joi.string().length(36)).required(),
  duration: Joi.number().min(15).required(),
  timing: Joi.string().custom(validateTime).required(),
  date: Joi.string().pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/).required(), // DD/MM/YYYY format
  services: Joi.array().items(Joi.string().min(2)),
  combos: Joi.array().items(Joi.string().min(2)),
  is_guest_appointment: Joi.boolean(),
  full_name: Joi.when('is_guest_appointment', {
    is: true,
    then: Joi.string().min(3).max(25).required(),
    otherwise: Joi.forbidden(),
  }),
  mobile: Joi.when('is_guest_appointment', {
    is: true,
    then: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
    otherwise: Joi.forbidden(),
  }),
})
  .custom(calculateSlotUuidsLength); // Apply custom validation

module.exports = validation;
