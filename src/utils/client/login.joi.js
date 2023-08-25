const joi = require("joi");

const validation = joi.object({
    username: joi.string().min(3).max(25).required().messages({
        'string.base': ` username should be a type of 'text'`,
        'string.empty': ` username cannot be an empty field`,
        'string.min': ` username should have a minimum length of {3}`,
        'string.max': ` username should have a minimum length of {25}`,
        'any.required': ` username is a required field`
      }),
    password: joi.string().min(3).max(25).trim(true).required(),
});

module.exports = validation