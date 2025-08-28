const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid ObjectId');

exports.createBody = Joi.object({
    libraryId: objectId.required(),
    items: Joi.array().items(
        Joi.object({
            bookId: objectId.required(),
            quantity: Joi.number().integer().min(1).required(),
        })
    ).min(1).required(),
});

exports.paramsLib = Joi.object({
    libraryId: objectId.required(),
});

exports.paramsLibAndReq = Joi.object({
    libraryId: objectId.required(),
    id: objectId.required(),
});

exports.statusQuery = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'delayed').default('pending'),
});

exports.rejectBody = Joi.object({
    note: Joi.string().allow('', null),
});

exports.delayBody = Joi.object({
    days: Joi.number().integer().min(1).max(365).required(),
    note: Joi.string().allow('', null),
});
