const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');


const BOOK_CATEGORY_MAP = {
    wantToRead: 'wantToReadBy',
    finished: 'finishedBy',
    favorites: 'favoritedBy',
    currentlyReading: 'currentlyReadingBy'
};


// Add book to a category
router.post('/books/:bookId/add-to-category', requireAuth, async (req, res) => {
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
router.post('/books/:bookId/remove-from-category', requireAuth, async (req, res) => {
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

// ---------- Avatar upload (to /public/images/avatars) ----------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'images', 'avatars')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safe = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.png';
        cb(null, `${req.user.id}-${Date.now()}${safe}`);
    }
});
const upload = multer({ storage });

// ---------- Get my profile ----------
router.get('/me', requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    // don’t send hashed password
    const { password, ...safe } = user;
    res.json(safe);
});

// ---------- Update profile (name, gender, dob, city) ----------
router.put('/me', requireAuth, async (req, res) => {
    const { firstName, lastName, gender, dob, city } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    if (gender) user.gender = gender;         // must be 'Male' | 'Female'
    if (dob) user.dob = new Date(dob);
    if (city) user.city = city;

    await user.save();
    const { password, ...safe } = user.toObject();
    res.json(safe);
});

// ---------- Change password ----------
router.patch('/me/password', requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword; // will be hashed by pre('save')
    await user.save();
    res.json({ ok: true });
});

// ---------- Upload avatar ----------
router.post('/me/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // store relative path for the static server: "images/avatars/filename.ext"
    const relPath = path.join('images', 'avatars', path.basename(req.file.path));
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: relPath },
        { new: true }
    ).lean();
    const { password, ...safe } = user;
    res.json(safe);
});

// ---------- Delete my account (danger zone) ----------
router.delete('/me', requireAuth, async (req, res) => {
    await User.findByIdAndDelete(req.user.id);
    // (Optional) also remove user from Book.reverse arrays if you rely on them
    res.json({ ok: true });
});

module.exports = router;
