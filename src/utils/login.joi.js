const joi = require("joi");

const validation = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }).trim(true).required(),
    otp: joi.string().min(6).trim(true).required(),
});

module.exports = validation