// routes/librarianInventory.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { canManageLibrary } = require('../middleware/libraryGuard');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const Library = require('../models/Library');
// const LibraryBook = require('../models/LibraryBook');

// Upsert: create book (optional) and add/increase stock in THIS library
// POST /api/librarian/:libraryId/inventory/add
router.post('/:libraryId/inventory/add', requireAuth, canManageLibrary(), async (req, res) => {
    const { bookId, title, author, genre, isbn, coverUrl, amount = 1, price } = req.body;
    if (!bookId && (!title || !author)) {
        return res.status(400).json({ message: 'Provide bookId OR (title & author) to create a book' });
    }
    const amt = Number(amount) || 0;
    if (amt <= 0) return res.status(400).json({ message: 'amount must be > 0' });

    let book = null;
    if (bookId) {
        book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });
    } else {
        // create catalog entry if not exists by isbn (optional)
        if (isbn) {
            book = await Book.findOne({ isbn });
        }
        if (!book) {
            book = await Book.create({ title, author, genre, isbn, coverUrl });
        }
    }

    const inv = await Inventory.findOneAndUpdate(
        { library: req.params.libraryId, book: book._id },
        { $inc: { stock: amt }, $set: { price, lastUpdatedAt: new Date() } },
        { upsert: true, new: true }
    );

    return res.status(201).json(inv);
});

// Decrease stock (cannot go below 0)
// PATCH /api/librarian/:libraryId/inventory/:bookId/decrease
router.patch('/:libraryId/inventory/:bookId/decrease', requireAuth, canManageLibrary(), async (req, res) => {
    const amt = Number(req.body.amount) || 0;
    if (amt <= 0) return res.status(400).json({ message: 'amount must be > 0' });

    const inv = await Inventory.findOne({ library: req.params.libraryId, book: req.params.bookId });
    if (!inv) return res.status(404).json({ message: 'Inventory item not found' });
    if (inv.stock < amt) return res.status(400).json({ message: 'Insufficient stock' });

    inv.stock -= amt;
    inv.lastUpdatedAt = new Date();
    await inv.save();

    return res.json(inv);
});

// List inventory for this library
// GET /api/librarian/:libraryId/inventory
router.get('/:libraryId/inventory', requireAuth, canManageLibrary(), async (req, res) => {
    const rows = await Inventory.find({ library: req.params.libraryId })
        .populate('book', 'title author genre isbn coverUrl')
        .sort({ 'book.title': 1 });
    res.json(rows);
});

router.get('/my-library', requireAuth, async (req, res) => {
    const lib = await Library.findOne({ owner: req.user.id });
    if (!lib) return res.status(404).json({ message: 'Library not found' });
    res.json(lib);
});

module.exports = router;
