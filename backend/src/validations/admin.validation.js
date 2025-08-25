const Joi = require('joi');

exports.listAppsQuery = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
});

exports.decideBody = Joi.object({
    decision: Joi.string().valid('approve', 'reject').required(),
    reviewNote: Joi.string().allow('', null),
});
