const Joi = require("joi");

const validation = Joi.object({
  appointment_uuid: Joi.string().length(36).required(),
})

module.exports = validation;
