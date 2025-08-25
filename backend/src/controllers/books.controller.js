const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');

const toId = (id) => new mongoose.Types.ObjectId(id);

// GET /api/books/search
exports.search = async (req, res, next) => {
    try {
        const { query, filter } = req.query;
        const q = (query || '').trim();

        let criteria = {};
        if (!q) {
            // no criteria -> return all (consider adding pagination later)
            criteria = {};
        } else if (!filter || filter === 'none') {
            criteria = {
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { author: { $regex: q, $options: 'i' } },
                    { genre: { $regex: q, $options: 'i' } },
                ]
            };
        } else if (filter === 'title') {
            criteria = { title: { $regex: q, $options: 'i' } };
        } else if (filter === 'author') {
            criteria = { author: { $regex: q, $options: 'i' } };
        } else if (filter === 'genre') {
            criteria = { genre: { $regex: q, $options: 'i' } };
        } else if (filter === 'rating') {
            const minRating = parseFloat(q) || 0;
            criteria = { rating: { $gte: minRating } };
        }

        const books = await Book.find(criteria).lean();
        res.json(books);
    } catch (err) {
        next(err);
    }
};

// GET /api/books
exports.list = async (_req, res, next) => {
    try {
        const books = await Book.find().lean();
        res.json(books);
    } catch (err) {
        next(err);
    }
};

// GET /api/books/:id
exports.getOne = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id).populate('reviews').lean();
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (err) {
        next(err);
    }
};

// POST /api/books/:id/reviews
exports.addReview = async (req, res, next) => {
    try {
        const { user, rating, comment } = req.body;

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        // Create review
        const review = await Review.create({
            user,
            rating: Number(rating),
            comment
        });

        // Attach review ObjectId to book
        book.reviews.push(review._id);
        await book.save();

        // Recompute average rating via aggregation (fast & ignores nulls)
        const avg = await aggregateAverageRating(book._id);

        // Update book's rating atomically
        await Book.updateOne({ _id: book._id }, { $set: { rating: avg } });

        // Return the fresh book with populated reviews
        const updated = await Book.findById(book._id).populate('reviews');
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// GET /api/books/:id/reviews
exports.listReviews = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id).populate('reviews');
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book.reviews || []);
    } catch (err) {
        next(err);
    }
};

// ---- helpers ----
async function aggregateAverageRating(bookId) {
    const rows = await Review.aggregate([
        { $match: { _id: { $in: (await Book.findById(bookId).select('reviews').lean()).reviews || [] } } },
        { $match: { rating: { $type: 'number' } } },
        {
            $group: {
                _id: null,
                avg: { $avg: '$rating' }
            }
        }
    ]);
    const avg = rows?.[0]?.avg || 0;
    // Round to 1 decimal if you want:
    return Math.round(avg * 10) / 10;
}
