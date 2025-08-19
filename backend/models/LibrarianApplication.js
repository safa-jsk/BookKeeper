const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const librarianApplicationSchema = new Schema({
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    motivation: { type: String, required: true, maxlength: 2000 },
    attachments: [{ url: String, label: String }], // optional
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNote: String
}, { timestamps: true });

librarianApplicationSchema.index({ applicant: 1, status: 1 });