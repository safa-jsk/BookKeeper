const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, rolesAtLeast, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book'); // For ObjectId validation
const Review = require('../models/Review'); // For ObjectId validation
const mongoose = require('mongoose'); // For ObjectId validation

router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; // <-- available here!
        // Dashboard logic...
        const user = await User.findById(userId)
            .populate('wantToRead')
            .populate('finished')
            .populate('favorites')
            .populate('currentlyReading');
        // ...respond
        res.json({
            currentlyReading: user.currentlyReading,
            wantToRead: user.wantToRead,
            finished: user.finished,
            favorites: user.favorites,
            booksReadThisYear: user.finished.length // Or filter by year if you track finish dates!
        });
    } catch (err) {
        res.status(500).json({ error: 'Dashboard fetch failed' });
    }
});

// Want to Read
// In dashboard.js route file
router.get('/want-to-read', requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('wantToRead');
    res.json({ wantToRead: user.wantToRead });
});

// Currently Reading
router.get('/currently-reading', requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('currentlyReading');
    res.json({ currentlyReading: user.currentlyReading });
});

// Finished
router.get('/finished', requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('finished');
    res.json({ finished: user.finished });
});

// Favorites
router.get('/favorites', requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({ favorites: user.favorites });
});

// Add a book to finished
router.patch('/users/me/reading/:bookId/finish', requireAuth, async (req, res) => {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: 'Invalid bookId' });
    }

    const [user, book] = await Promise.all([
        User.findById(req.user.id),
        Book.findById(bookId)
    ]);
    if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });

    // Remove from user's currentlyReading (ObjectId[])
    const idx = user.currentlyReading.findIndex(id => id.toString() === bookId);
    if (idx === -1) return res.status(400).json({ message: 'Book not in currently reading' });
    user.currentlyReading.splice(idx, 1);

    // Add to user's finished if not already
    if (!user.finished.some(id => id.toString() === bookId)) {
        user.finished.push(bookId);
    }

    // Mirror on Book: remove from currentlyReadingBy, add to finishedBy
    book.currentlyReadingBy = book.currentlyReadingBy.filter(uid => uid.toString() !== user._id.toString());
    if (!book.finishedBy.some(uid => uid.toString() === user._id.toString())) {
        book.finishedBy.push(user._id);
    }

    await Promise.all([user.save(), book.save()]);
    return res.json({ ok: true });
});

module.exports = router;
