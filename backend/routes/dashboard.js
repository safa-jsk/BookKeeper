const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <-- your middleware
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id; // <-- available here!
        // Your dashboard logic...
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

module.exports = router;
