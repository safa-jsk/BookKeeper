const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  genre: String,
  year: Number,
  rating: Number
  // Add more fields as needed (description, cover, etc.)
});

module.exports = mongoose.model('Book', bookSchema);
