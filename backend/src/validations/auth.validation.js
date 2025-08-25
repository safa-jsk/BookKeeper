const Joi = require('joi');

exports.register = Joi.object({
    firstName: Joi.string().trim().min(1).required(),
    lastName: Joi.string().trim().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    dob: Joi.date().iso().required(),
    city: Joi.string().trim().min(1).required(),
});

exports.login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
});
