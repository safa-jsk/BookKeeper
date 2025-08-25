// models/Cart.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const cartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true, index: true },
    items: [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
