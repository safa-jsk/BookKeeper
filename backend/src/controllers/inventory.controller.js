const mongoose = require('mongoose');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');

const toId = (id) => new mongoose.Types.ObjectId(id);

// POST /api/librarian/:libraryId/inventory/add
exports.addOrIncrease = async (req, res, next) => {
    try {
        const libraryId = toId(req.params.libraryId);
        let { bookId, title, author, genre, year, isbn, image, coverUrl, amount = 1, price } = req.body;

        const inc = Number(amount) || 0;
        if (inc <= 0) return res.status(400).json({ message: 'amount must be > 0' });

        let book = null;
        if (bookId) {
            book = await Book.findById(bookId);
            if (!book) return res.status(404).json({ message: 'Book not found' });
        } else {
            if (!genre || typeof year === 'undefined') {
                return res.status(400).json({ message: 'genre and year are required when creating a new book' });
            }
            if (isbn) book = await Book.findOne({ isbn });
            if (!book) {
                const img = image || coverUrl || undefined;
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
                    if (err?.code === 11000 && err?.keyPattern?.isbn) {
                        return res.status(400).json({ message: 'ISBN already exists for another book' });
                    }
                    throw err;
                }
            }
        }

        const update = { $inc: { stock: inc }, $set: { lastUpdatedAt: new Date() } };
        if (price !== undefined && price !== null && `${price}` !== '') update.$set.price = Number(price);

        const inv = await Inventory.findOneAndUpdate(
            { library: libraryId, book: book._id },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate('book', 'title author genre isbn year image');

        return res.status(201).json(inv);
    } catch (e) { next(e); }
};

// PATCH /api/librarian/:libraryId/inventory/:bookId/decrease
exports.decrease = async (req, res, next) => {
    try {
        const libraryId = toId(req.params.libraryId);
        const bookId = toId(req.params.bookId);
        const dec = Number(req.body.amount) || 0;
        if (dec <= 0) return res.status(400).json({ message: 'amount must be > 0' });

        const result = await Inventory.updateOne(
            { library: libraryId, book: bookId, stock: { $gte: dec } },
            { $inc: { stock: -dec }, $set: { lastUpdatedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(400).json({ message: 'Insufficient stock' });

        const updated = await Inventory.findOne({ library: libraryId, book: bookId })
            .populate('book', 'title author genre isbn year image');
        res.json(updated);
    } catch (e) { next(e); }
};

// GET /api/librarian/:libraryId/inventory
exports.listMine = async (req, res, next) => {
    try {
        const rows = await Inventory.find({ library: req.params.libraryId })
            .populate('book', 'title author genre isbn year image')
            .sort({ 'book.title': 1 });
        res.json(rows);
    } catch (e) { next(e); }
};

// GET /api/librarian/:libraryId/inventory/catalog
exports.catalog = async (req, res, next) => {
    try {
        const libraryId = toId(req.params.libraryId);

        const data = await Book.aggregate([
            { $sort: { updatedAt: -1, title: 1 } },
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
                        { $project: { stock: 1, price: 1 } },
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
                        title: 1, author: 1, genre: 1, isbn: 1, year: 1, image: 1, rating: 1,
                    },
                    stock: { $ifNull: ['$mine.stock', 0] },
                    price: '$mine.price',
                    totalStock: { $ifNull: ['$global.totalStock', 0] },
                }
            }
        ]).allowDiskUse(true);

        res.json(data);
    } catch (e) { next(e); }
};

// Books Set Price
exports.setPrice = async (req, res, next) => {
    try {
        const libraryId = req.params.libraryId;
        const bookId = req.params.bookId;
        const price = Number(req.body.price);
        if (Number.isNaN(price) || price < 0) return res.status(400).json({ message: 'Invalid price' });

        const updated = await Inventory.findOneAndUpdate(
            { library: libraryId, book: bookId },
            { $set: { price, lastUpdatedAt: new Date() } },
            { new: true }
        ).populate('book', 'title author genre isbn year image');

        if (!updated) return res.status(404).json({ message: 'Inventory item not found' });
        res.json(updated);
    } catch (e) { next(e); }
};
