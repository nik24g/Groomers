const joi = require("joi");

const validation = joi.object({
    full_name: joi.string().min(3).max(25).required().messages({
        'string.base': ` fullname should be a type of 'text'`,
        'string.empty': ` fullname cannot be an empty field`,
        'string.min': ` fullname should have a minimum length of {3}`,
        'string.max': ` fullname should have a minimum length of {25}`,
        'any.required': ` fullname is a required field`
      }),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }).trim(true).required(),
    mobile: joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
});

module.exports = validation