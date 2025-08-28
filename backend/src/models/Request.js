// models/Request.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqItemSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const requestSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    library: { type: Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
    items: { type: [reqItemSchema], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'delayed', 'cancelled'], default: 'pending', index: true },
    note: String,
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    decidedAt: Date,
    expectedAt: Date,
}, { timestamps: true });

requestSchema.index({ library: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
