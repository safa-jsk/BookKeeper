const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid ObjectId');

exports.paramsWithLibraryId = Joi.object({
    libraryId: objectId.required(),
});

exports.paramsWithLibAndBook = Joi.object({
    libraryId: objectId.required(),
    bookId: objectId.required(),
});

exports.addOrIncrease = Joi.object({
    bookId: objectId.optional(),
    title: Joi.when('bookId', { is: Joi.exist(), then: Joi.forbidden(), otherwise: Joi.string().min(1).required() }),
    author: Joi.when('bookId', { is: Joi.exist(), then: Joi.forbidden(), otherwise: Joi.string().min(1).required() }),
    genre: Joi.when('bookId', { is: Joi.exist(), then: Joi.forbidden(), otherwise: Joi.string().min(1).required() }),
    year: Joi.when('bookId', { is: Joi.exist(), then: Joi.forbidden(), otherwise: Joi.number().integer().required() }),

    isbn: Joi.string().allow('', null),
    image: Joi.string().uri().allow('', null),
    coverUrl: Joi.string().uri().allow('', null),
    amount: Joi.number().integer().min(1).default(1),
    price: Joi.number().min(0).allow(null, ''),
});

exports.decrease = Joi.object({
    amount: Joi.number().integer().min(1).required(),
});

exports.setPrice = Joi.object({ price: Joi.number().min(0).required() });
