const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: String, required: true },   // reviewer name
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Better: let Mongoose pluralize -> 'reviews'
module.exports = mongoose.model('Review', reviewSchema);
