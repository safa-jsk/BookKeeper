// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Library = require('../models/Library'); // <-- make sure this file exists
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, gender, dob, city } = req.body;
    if (!firstName || !lastName || !email || !password || !gender || !dob || !city) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists.' });

        const user = new User({ firstName, lastName, email, password, gender, dob, city });
        await user.save();
        res.json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Try to resolve libraryId for librarians (do NOT crash login if fails)
        let libraryId = null;
        if (user.role === 'librarian') {
            try {
                const lib = await Library.findOne({ owner: user._id }).select('_id').lean();
                libraryId = lib?._id ?? null;
            } catch (e) {
                console.warn('login: library lookup failed (non-fatal):', e?.message || e);
                libraryId = null;
            }
        }

        const userInfo = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            city: user.city,
            gender: user.gender,
            role: user.role,
            librarianApplicationStatus: user.librarianApplicationStatus,
            libraryId // may be null if not created yet
        };

        const token = jwt.sign({ id: user._id, ...userInfo }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: userInfo });
    } catch (err) {
        console.error('login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
