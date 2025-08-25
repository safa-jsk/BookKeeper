// models/Inventory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new Schema({
    library: { type: Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    stock: { type: Number, min: 0, default: 0, required: true },
    price: { type: Number, min: 0 }, // optional per-library pricing
    lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

inventorySchema.index({ library: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
