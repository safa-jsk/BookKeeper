const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <-- your middleware
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
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
router.get('/want-to-read', auth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('wantToRead');
    res.json({ wantToRead: user.wantToRead });
});

// Currently Reading
router.get('/currently-reading', auth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('currentlyReading');
    res.json({ currentlyReading: user.currentlyReading });
});

// Finished
router.get('/finished', auth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('finished');
    res.json({ finished: user.finished });
});

// Favorites
router.get('/favorites', auth, async (req, res) => {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({ favorites: user.favorites });
});

module.exports = router;
