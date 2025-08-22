// models/LibraryBook.js
const libraryBookSchema = new Schema({
    library: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    stock: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

libraryBookSchema.index({ library: 1, book: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
