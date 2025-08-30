const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const recommendationService = require('../services/recommendationService');

const BOOK_PROJECTION = 'title author genre image rating year'; // tweak as you like

// GET /api/dashboard/
exports.getOverview = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('wantToRead', BOOK_PROJECTION)
            .populate('finished', BOOK_PROJECTION)
            .populate('favorites', BOOK_PROJECTION)
            .populate('currentlyReading', BOOK_PROJECTION)
            .lean();

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Compute global availability for Want To Read across all libraries
        const wantIds = (user.wantToRead || []).map(b => b._id);
        let availabilityMap = {};
        if (wantIds.length > 0) {
            const rows = await Inventory.aggregate([
                { $match: { book: { $in: wantIds } } },
                { $group: { _id: '$book', total: { $sum: '$stock' } } }
            ]);
            availabilityMap = Object.fromEntries(rows.map(r => [String(r._id), (r.total || 0) > 0]));
        }

        const wantWithAvailability = (user.wantToRead || []).map(b => ({
            ...b,
            available: !!availabilityMap[String(b._id)]
        }));

        // Get AI recommendations based on finished books
        const finishedBookIds = (user.finished || []).map(book => book._id.toString());
        const recommendations = await recommendationService.getRecommendationsWithDetails(finishedBookIds, 6);

        // Get recommended book details
        const recommendedBookIds = recommendations.map(rec => rec.dbId);
        const recommendedBooks = await Book.find({ _id: { $in: recommendedBookIds } })
            .select(BOOK_PROJECTION)
            .lean();

        // Map recommendations with book details
        const recommendationsWithDetails = recommendations.map(rec => {
            const book = recommendedBooks.find(b => b._id.toString() === rec.dbId);
            return {
                ...rec,
                book: book || {
                    _id: rec.dbId,
                    title: rec.title,
                    author: 'Unknown Author',
                    genre: 'Unknown Genre',
                    rating: 0,
                    image: '/images/books/default-book.jpg'
                }
            };
        });

        res.json({
            currentlyReading: user.currentlyReading || [],
            wantToRead: wantWithAvailability,
            finished: user.finished || [],
            favorites: user.favorites || [],
            booksReadThisYear: (user.finished || []).length, // (optionally filter by year if you store dates)
            recommendations: recommendationsWithDetails
        });
    } catch (err) { next(err); }
};

// GET /api/dashboard/want-to-read
exports.getWantToRead = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('wantToRead', BOOK_PROJECTION)
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ wantToRead: user.wantToRead || [] });
    } catch (err) { next(err); }
};

// GET /api/dashboard/currently-reading
exports.getCurrentlyReading = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('currentlyReading', BOOK_PROJECTION)
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ currentlyReading: user.currentlyReading || [] });
    } catch (err) { next(err); }
};

// GET /api/dashboard/finished
exports.getFinished = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('finished', BOOK_PROJECTION)
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ finished: user.finished || [] });
    } catch (err) { next(err); }
};

// GET /api/dashboard/favorites
exports.getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('favorites', BOOK_PROJECTION)
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ favorites: user.favorites || [] });
    } catch (err) { next(err); }
};

// PATCH /api/dashboard/users/me/reading/:bookId/finish
exports.finishBook = async (req, res, next) => {
    try {
        const { bookId } = req.params;

        // Ensure both documents exist
        const [user, book] = await Promise.all([
            User.findById(req.user.id).select('currentlyReading finished'),
            Book.findById(bookId).select('_id currentlyReadingBy finishedBy'),
        ]);
        if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });

        // Guard: must be in currentlyReading
        const isInCR = (user.currentlyReading || []).some(id => id.toString() === bookId);
        if (!isInCR) return res.status(400).json({ message: 'Book not in currently reading' });

        // Apply atomic updates (race-safe)
        const userUpdate = User.updateOne(
            { _id: user._id },
            {
                $pull: { currentlyReading: book._id },
                $addToSet: { finished: book._id }
            }
        );

        const bookUpdate = Book.updateOne(
            { _id: book._id },
            {
                $pull: { currentlyReadingBy: user._id },
                $addToSet: { finishedBy: user._id }
            }
        );

        await Promise.all([userUpdate, bookUpdate]);

        return res.json({ ok: true });
    } catch (err) { next(err); }
};
