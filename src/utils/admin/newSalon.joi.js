const Joi = require('joi');

const salonSchema = Joi.object({
    username: Joi.string().min(5).max(15).required(),
    password: Joi.string().min(5).max(15).required(),
    code: Joi.string().alphanum().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }).trim(true).required(),
    type: Joi.string().valid('male', 'female', 'unisex').required(),
    address: Joi.string().min(10).required(),
    area: Joi.string().min(3).required(),
    city: Joi.string().required().min(3).max(20),
    state: Joi.string().required().min(3).max(20),
    location: Joi.string().pattern(/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/).required(),
    slots: Joi.number().integer().required(),
    services: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        discount: Joi.number().required(),
        original_price: Joi.number().required(),
        duration: Joi.string().required(),
    })).required(),

    combo_services: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        services_name: Joi.array().items(Joi.string().required()).required(),
        price: Joi.number().required(),
        duration: Joi.string().required(),
    })).required(),
    opening_time: Joi.string().regex(/^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/).required(),
    closing_time: Joi.string().regex(/^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/).required(),
    lunch_start_time: Joi.string().regex(/^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/).required(),
    lunch_end_time: Joi.string().regex(/^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/).required(),
    features: Joi.object({
        wifi: Joi.boolean().required(),
        parking: Joi.boolean().required(),
        AC: Joi.boolean().required(),
    }).required(),
    languages: Joi.object({
        hindi: Joi.boolean().required(),
        english: Joi.boolean().required(),
        telugu: Joi.boolean().required(),
    }).required(),
    owner_name: Joi.string().min(3).max(15).required(),
    owner_mobile: Joi.string().min(10).max(15).required(),
    owner_pancard_number: Joi.string().length(10).required(),
    bank_name: Joi.string().min(3).required(),
    bank_account_number: Joi.string().min(3).required(),
    bank_IFSC_code: Joi.string().min(3).required(),
});

module.exports = salonSchema;