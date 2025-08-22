// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Inventory = require('../models/Inventory');
const Library = require('../models/Library');

// Ensure one cart per user
async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.book', 'title author genre coverUrl');
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
}

// Add or update a cart item
// POST /api/cart/items  { bookId, quantity }
router.post('/items', requireAuth, async (req, res) => {
    const { bookId, quantity = 1 } = req.body;
    if (!bookId) return res.status(400).json({ message: 'bookId required' });
    const qty = Math.max(1, Number(quantity));

    const cart = await getOrCreateCart(req.user.id);
    const i = cart.items.findIndex(it => it.book.toString() === bookId);
    if (i >= 0) {
        cart.items[i].quantity = qty;
    } else {
        cart.items.push({ book: bookId, quantity: qty });
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.book', 'title author genre coverUrl');
    res.json(populated);
});

// Remove item
router.delete('/items/:bookId', requireAuth, async (req, res) => {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter(it => it.book.toString() !== req.params.bookId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.book', 'title author genre coverUrl');
    res.json(populated);
});

// View cart + availability per library
// GET /api/cart
router.get('/', requireAuth, async (req, res) => {
    const cart = await getOrCreateCart(req.user.id);

    // Aggregate availability for each cart book across libraries
    const bookIds = cart.items.map(i => i.book._id || i.book);
    const invs = await Inventory.find({ book: { $in: bookIds } })
        .populate('library', 'name address1 address2 city zip')
        .select('book library stock');

    // Map: bookId -> [{ library, stock }]
    const availability = {};
    for (const inv of invs) {
        const b = inv.book.toString();
        if (!availability[b]) availability[b] = [];
        availability[b].push({
            libraryId: inv.library._id,
            libraryName: inv.library.name,
            address: `${inv.library.address1}${inv.library.address2 ? ', ' + inv.library.address2 : ''}, ${inv.library.city} ${inv.library.zip}`,
            stock: inv.stock
        });
    }

    res.json({ cart, availability });
});

module.exports = router;
