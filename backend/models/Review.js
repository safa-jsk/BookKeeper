const mongoose = require('mongoose');

// Define the Review Schema
const reviewSchema = new mongoose.Schema({
    user: { type: String, required: true },   // Name of the user who wrote the review
    rating: { type: Number, required: true }, // Rating (1 to 5)
    comment: { type: String, required: true }, // Review comment
    date: { type: Date, default: Date.now }   // Review creation date
});

// Explicitly specify the collection name
module.exports = mongoose.model('Review', reviewSchema, 'review');  // Explicitly set collection name to 'review'
