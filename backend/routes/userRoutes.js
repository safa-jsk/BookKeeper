const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');

const BOOK_CATEGORY_MAP = {
    wantToRead: 'wantToReadBy',
    finished: 'finishedBy',
    favorites: 'favoritedBy',
    currentlyReading: 'currentlyReadingBy'
};


// Add book to a category
router.post('/books/:bookId/add-to-category', auth, async (req, res) => {
    const { category } = req.body;
    const { bookId } = req.params;
    const userId = req.user.id;

    if (!Object.keys(BOOK_CATEGORY_MAP).includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        // Add bookId to user's category array
        await User.findByIdAndUpdate(userId, { $addToSet: { [category]: bookId } });

        // Add userId to book's category array
        const bookCategory = BOOK_CATEGORY_MAP[category];
        await Book.findByIdAndUpdate(bookId, { $addToSet: { [bookCategory]: userId } });

        res.json({ success: true, message: `Book added to ${category}` });
    } catch (err) {
        console.error(err); // for debugging!
        res.status(500).json({ error: "Failed to add book to category" });
    }
});

// Remove book from a category
router.post('/books/:bookId/remove-from-category', auth, async (req, res) => {
    const { category } = req.body;
    const { bookId } = req.params;
    const userId = req.user.id;

    if (!Object.keys(BOOK_CATEGORY_MAP).includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        // Remove bookId from user's category array
        await User.findByIdAndUpdate(userId, { $pull: { [category]: bookId } });

        // Remove userId from book's category array
        const bookCategory = BOOK_CATEGORY_MAP[category];
        await Book.findByIdAndUpdate(bookId, { $pull: { [bookCategory]: userId } });

        res.json({ success: true, message: `Book removed from ${category}` });
    } catch (err) {
        console.error(err); // for debugging!
        res.status(500).json({ error: "Failed to remove book from category" });
    }
});

module.exports = router;
