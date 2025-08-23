// routes/librarianInventory.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { canManageLibrary } = require('../middleware/libraryGuard');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const Library = require('../models/Library');

// --- helpers ---
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// Upsert: create book (optional) and add/increase stock in THIS library
// POST /api/librarian/:libraryId/inventory/add
router.post('/:libraryId/inventory/add', requireAuth, canManageLibrary(), async (req, res) => {
    try {
        const libraryId = toObjectId(req.params.libraryId);
        let {
            bookId,
            title, author, genre, year, isbn,
            image, coverUrl,        // accept either; we'll map to image
            amount = 1,
            price
        } = req.body;

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
            // When creating, your Book schema REQUIRES genre and year
            if (!genre || typeof year === 'undefined') {
                return res.status(400).json({ message: 'genre and year are required when creating a new book' });
            }

            // If ISBN present, try reuse existing catalog entry
            if (isbn) {
                book = await Book.findOne({ isbn });
            }

            if (!book) {
                const img = image || coverUrl || undefined; // align to schema field "image"
                try {
                    book = await Book.create({
                        title: title.trim(),
                        author: author.trim(),
                        genre: genre.trim(),
                        year: Number(year),
                        isbn: isbn?.trim() || undefined,
                        image: img?.trim(),
                    });
                } catch (err) {
                    // duplicate ISBN friendly msg
                    if (err?.code === 11000 && err?.keyPattern?.isbn) {
                        return res.status(400).json({ message: 'ISBN already exists for another book' });
                    }
                    throw err;
                }
            }
        }

        const update = {
            $inc: { stock: amt },
            $set: { lastUpdatedAt: new Date() }
        };
        if (price !== undefined && price !== null && `${price}` !== '') {
            update.$set.price = Number(price);
        }

        const inv = await Inventory.findOneAndUpdate(
            { library: libraryId, book: book._id },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate('book', 'title author genre isbn year image');

        return res.status(201).json(inv);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Failed to add/increase inventory' });
    }
});

// Decrease stock (atomic; cannot go below 0)
// PATCH /api/librarian/:libraryId/inventory/:bookId/decrease
router.patch('/:libraryId/inventory/:bookId/decrease', requireAuth, canManageLibrary(), async (req, res) => {
    try {
        const libraryId = toObjectId(req.params.libraryId);
        const bookId = toObjectId(req.params.bookId);
        const amt = Number(req.body.amount) || 0;
        if (amt <= 0) return res.status(400).json({ message: 'amount must be > 0' });

        // atomic conditional update to avoid race conditions
        const result = await Inventory.updateOne(
            { library: libraryId, book: bookId, stock: { $gte: amt } },
            { $inc: { stock: -amt }, $set: { lastUpdatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const updated = await Inventory
            .findOne({ library: libraryId, book: bookId })
            .populate('book', 'title author genre isbn year image');

        return res.json(updated);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Failed to decrease inventory' });
    }
});

// List inventory for this library (existing)
// GET /api/librarian/:libraryId/inventory
router.get('/:libraryId/inventory', requireAuth, canManageLibrary(), async (req, res) => {
    const rows = await Inventory.find({ library: req.params.libraryId })
        .populate('book', 'title author genre isbn year image')
        .sort({ 'book.title': 1 });
    res.json(rows);
});

// NEW: Catalog view = all Books + this library’s stock/price + TOTAL stock (all libraries)
// GET /api/librarian/:libraryId/inventory/catalog
router.get('/:libraryId/inventory/catalog', requireAuth, canManageLibrary(), async (req, res) => {
    try {
        const libraryId = toObjectId(req.params.libraryId);

        const data = await Book.aggregate([
            { $sort: { updatedAt: -1, title: 1 } },

            // total stock over ALL libraries
            {
                $lookup: {
                    from: 'inventories',
                    let: { bid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$book', '$$bid'] } } },
                        { $group: { _id: '$book', totalStock: { $sum: '$stock' } } },
                    ],
                    as: 'global'
                }
            },
            { $unwind: { path: '$global', preserveNullAndEmptyLists: true } },

            // this library’s stock & price
            {
                $lookup: {
                    from: 'inventories',
                    let: { bid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$book', '$$bid'] },
                                        { $eq: ['$library', libraryId] },
                                    ]
                                }
                            }
                        },
                        { $project: { stock: 1, price: 1 } }
                    ],
                    as: 'mine'
                }
            },
            { $unwind: { path: '$mine', preserveNullAndEmptyLists: true } },

            {
                $project: {
                    _id: 0,
                    book: {
                        _id: '$_id',
                        title: 1, author: 1, genre: 1, isbn: 1, year: 1, image: 1, rating: 1
                    },
                    stock: { $ifNull: ['$mine.stock', 0] },
                    price: '$mine.price',
                    totalStock: { $ifNull: ['$global.totalStock', 0] }
                }
            }
        ]).allowDiskUse(true);

        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to load catalog' });
    }
});

router.get('/my-library', requireAuth, async (req, res) => {
    const lib = await Library.findOne({ owner: req.user.id });
    if (!lib) return res.status(404).json({ message: 'Library not found' });
    res.json(lib);
});

module.exports = router;
