// models/Library.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const librarySchema = new Schema({
    // Ownership & management
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    managers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }], // optional extra librarians

    // Identity
    name: { type: String, required: true, trim: true, index: true },

    // Address
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    zip: { type: String, required: true, trim: true },

    // Optional metadata (from application)
    ownerPhone: { type: String, trim: true, index: true },
    website: { type: String, trim: true },
    about: { type: String, trim: true },

    // For traceability back to the application
    sourceApplication: { type: Schema.Types.ObjectId, ref: 'LibrarianApplication', index: true }
}, { timestamps: true });

librarySchema.index({ owner: 1, name: 1 }, { unique: true }); // one owner can’t create dup name

module.exports = mongoose.model('Library', librarySchema);
