const Joi = require('joi');

exports.checkPhoneQuery = Joi.object({
    phone: Joi.string().min(3).required(), // we’ll normalize to digits later
});

exports.applyBody = Joi.object({
    libraryName: Joi.string().min(2).required(),
    address1: Joi.string().min(3).required(),
    address2: Joi.string().allow('', null),
    zip: Joi.string().min(3).required(),
    ownerPhone: Joi.string().min(7).required(), // raw; digits validated after normalization
    genres: Joi.array().items(Joi.string().trim()).min(3).required(),
    website: Joi.string().uri().allow('', null),
    about: Joi.string().allow('', null),
    termsAccepted: Joi.boolean().valid(true).required(),
    motivation: Joi.string().min(1).required(),
});
