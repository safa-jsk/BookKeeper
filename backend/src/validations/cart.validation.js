const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid ObjectId');

exports.addOrUpdateBody = Joi.object({
    bookId: objectId.required(),
    quantity: Joi.number().integer().min(1).default(1),
});

exports.bookIdParam = Joi.object({
    bookId: objectId.required(),
});
