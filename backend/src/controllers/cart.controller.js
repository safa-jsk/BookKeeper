const Cart = require('../models/Cart');
const Inventory = require('../models/Inventory');

/** Always populate with Book fields that actually exist (image, not coverUrl). */
const BOOK_PROJECTION = 'title author genre image';

/** Ensure one cart per user, with populated books. */
async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.book', BOOK_PROJECTION);
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
}

/** POST /api/cart/items  { bookId, quantity } */
exports.addOrUpdateItem = async (req, res, next) => {
    try {
        const { bookId, quantity = 1 } = req.body;
        const qty = Math.max(1, Number(quantity));

        const cart = await getOrCreateCart(req.user.id);
        const idx = cart.items.findIndex(it => {
            const currentId = (it.book && it.book._id) ? it.book._id.toString() : it.book.toString();
            return currentId === bookId;
        });

        if (idx >= 0) {
            cart.items[idx].quantity = qty;
        } else {
            cart.items.push({ book: bookId, quantity: qty });
        }
        await cart.save();

        const populated = await Cart.findById(cart._id).populate('items.book', BOOK_PROJECTION);
        res.json(populated);
    } catch (err) { next(err); }
};

/** DELETE /api/cart/items/:bookId */
exports.removeItem = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const cart = await getOrCreateCart(req.user.id);
        cart.items = cart.items.filter(it => {
            const currentId = (it.book && it.book._id) ? it.book._id.toString() : it.book.toString();
            return currentId !== bookId;
        });
        await cart.save();

        const populated = await Cart.findById(cart._id).populate('items.book', BOOK_PROJECTION);
        res.json(populated);
    } catch (err) { next(err); }
};

/** GET /api/cart  -> { cart, availability } */
exports.getCart = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user.id);

        // collect Book ids from cart
        const bookIds = cart.items.map(i => i.book._id || i.book);

        // all inventory entries for those books, with library projection
        const invs = await Inventory.find({ book: { $in: bookIds } })
            .populate('library', 'name address1 address2 city zip')
            .select('book library stock')
            .lean();

        // bookId -> [{ libraryId, libraryName, address, stock }]
        const availability = {};
        for (const inv of invs) {
            const b = inv.book.toString();
            if (!availability[b]) availability[b] = [];
            const lib = inv.library;
            availability[b].push({
                libraryId: lib._id,
                libraryName: lib.name,
                address: `${lib.address1}${lib.address2 ? ', ' + lib.address2 : ''}, ${lib.city} ${lib.zip}`,
                stock: inv.stock,
            });
        }

        res.json({ cart, availability });
    } catch (err) { next(err); }
};
