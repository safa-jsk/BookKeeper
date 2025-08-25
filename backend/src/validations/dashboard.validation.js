const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid ObjectId');

exports.bookIdParam = Joi.object({
    bookId: objectId.required(),
});
