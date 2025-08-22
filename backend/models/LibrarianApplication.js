const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const librarianApplicationSchema = new Schema({
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    motivation: { type: String, required: true, maxlength: 2000 },
    attachments: [{ url: String, label: String }], // optional
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNote: String,
    libraryName: { type: String, required: true },
    address1: { type: String, required: true },
    address2: String,
    city: { type: String, required: true },
    zip: { type: String, required: true },
    ownerPhone: { type: String, unique: true, index: true },
    genres: [{ type: String, required: true }], // min length >= 3 validated in controller
    website: String,          // optional
    about: String,            // optional
    termsAccepted: { type: Boolean, default: false }
}, { timestamps: true });

librarianApplicationSchema.index({ applicant: 1, status: 1 });
librarianApplicationSchema.index({ ownerPhone: 1 }, { unique: true });

module.exports = mongoose.model('LibrarianApplication', librarianApplicationSchema);