const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Book Schema
const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String, required: false }, // Store the image URL here
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  wantToReadBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  finishedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentlyReadingBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Book', bookSchema);
