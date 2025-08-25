const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Book Schema
const bookSchema = new Schema({
  title: { type: String, required: true, trim: true, index: true },
  author: { type: String, required: true, trim: true, index: true },
  genre: { type: String, required: true, trim: true, index: true },
  isbn: { type: String, trim: true, unique: true, sparse: true },
  year: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String, required: false, trim: true }, // Store the image URL here
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  wantToReadBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  finishedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentlyReadingBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
