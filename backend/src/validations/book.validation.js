const Joi = require('joi');

exports.searchQuery = Joi.object({
    query: Joi.string().allow('', null),
    filter: Joi.string().valid('none', 'title', 'author', 'genre', 'rating').allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(25),
});

exports.bookIdParam = Joi.object({
    id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
});

exports.addReview = Joi.object({
    user: Joi.string().trim().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow('', null),
});
