const Joi = require('joi');

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid ObjectId');
const categories = ['wantToRead', 'finished', 'favorites', 'currentlyReading'];

exports.bookIdParam = Joi.object({
    bookId: objectId.required(),
});

exports.categoryBody = Joi.object({
    category: Joi.string().valid(...categories).required(),
});

exports.updateMe = Joi.object({
    firstName: Joi.string().trim().min(1).optional(),
    lastName: Joi.string().trim().min(1).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    dob: Joi.date().iso().optional(),
    city: Joi.string().trim().optional(),
    theme: Joi.string().trim().optional(),
});

exports.changePassword = Joi.object({
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
});
