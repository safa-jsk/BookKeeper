const path = require('path');
const User = require('../models/User');
const Book = require('../models/Book');

const BOOK_CATEGORY_MAP = {
    wantToRead: 'wantToReadBy',
    finished: 'finishedBy',
    favorites: 'favoritedBy',
    currentlyReading: 'currentlyReadingBy'
};

// POST /api/user/books/:bookId/add-to-category
exports.addBookToCategory = async (req, res, next) => {
    try {
        const { category } = req.body;
        const { bookId } = req.params;
        const userId = req.user.id;

        // Update both sides atomically
        const [u, b] = await Promise.all([
            User.updateOne({ _id: userId }, { $addToSet: { [category]: bookId } }),
            Book.updateOne({ _id: bookId }, { $addToSet: { [BOOK_CATEGORY_MAP[category]]: userId } })
        ]);
        res.json({ success: true, message: `Book added to ${category}` });
    } catch (err) { next(err); }
};

// POST /api/user/books/:bookId/remove-from-category
exports.removeBookFromCategory = async (req, res, next) => {
    try {
        const { category } = req.body;
        const { bookId } = req.params;
        const userId = req.user.id;

        await Promise.all([
            User.updateOne({ _id: userId }, { $pull: { [category]: bookId } }),
            Book.updateOne({ _id: bookId }, { $pull: { [BOOK_CATEGORY_MAP[category]]: userId } })
        ]);
        res.json({ success: true, message: `Book removed from ${category}` });
    } catch (err) { next(err); }
};

// GET /api/user/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...safe } = user;
        res.json(safe);
    } catch (err) { next(err); }
};

// PUT /api/user/me
exports.updateMe = async (req, res, next) => {
    try {
        const { firstName, lastName, gender, dob, city, theme } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (firstName != null) user.firstName = firstName;
        if (lastName != null) user.lastName = lastName;
        if (gender) user.gender = gender;
        if (dob) user.dob = new Date(dob);
        if (city) user.city = city;
        if (theme) user.theme = String(theme);

        await user.save();
        const { password, ...safe } = user.toObject();
        res.json(safe);
    } catch (err) { next(err); }
};

// PATCH /api/user/me/password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const ok = await user.comparePassword(currentPassword);
        if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = newPassword; // hashed by pre('save')
        await user.save();
        res.json({ ok: true });
    } catch (err) { next(err); }
};

// POST /api/user/me/avatar
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        // store relative path for static server
        const relPath = path.join('images', 'avatars', path.basename(req.file.path));
        const user = await User.findByIdAndUpdate(req.user.id, { avatar: relPath }, { new: true }).lean();
        const { password, ...safe } = user;
        res.json(safe);
    } catch (err) { next(err); }
};

// DELETE /api/user/me
exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        // Optional: also $pull user from Book reverse arrays
        res.json({ ok: true });
    } catch (err) { next(err); }
};
