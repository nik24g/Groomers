const Joi = require("joi");

// Custom validation function to calculate required length of slot_uuids array
function calculateSlotUuidsLength(value, helpers) {
  const duration = value.duration;
  const requiredLength = Math.ceil(duration / 30);

  if (value.slot_uuids.length !== requiredLength) {
    return helpers.message(`The 'slot_uuids' array length should be ${requiredLength}.`);
  }

  return value;
}

const validation = Joi.object({
  slot_uuids: Joi.array().items(Joi.string().length(36)).required(),
  duration: Joi.number().min(30).required(),
  timing: Joi.string().min(5).max(8).required(),
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
//developed by Nitin Goswami