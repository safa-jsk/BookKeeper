const jwt = require('jsonwebtoken');
const env = require('../config/env');              // has JWT_SECRET, etc.
const User = require('../models/User');
const Library = require('../models/Library');      // you already have this

// POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, gender, dob, city } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists.' });

        const user = new User({ firstName, lastName, email, password, gender, dob, city });
        await user.save();

        return res.json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('register error:', err);
        next(err);
    }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Resolve libraryId for librarians (non-fatal if lookup fails).
        let libraryId = null;
        if (user.role === 'librarian') {
            try {
                // owner OR manager could have a library; prefer owner
                const lib = await Library
                    .findOne({ owner: user._id })
                    .select('_id')
                    .lean();

                if (lib?._id) libraryId = lib._id;
                else {
                    const managed = await Library
                        .findOne({ managers: user._id })
                        .select('_id')
                        .lean();
                    libraryId = managed?._id ?? null;
                }
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
            libraryId, // may be null
        };

        // Keep JWT small: id + role are usually enough; but we’ll keep your style for now
        const token = jwt.sign(
            { id: user._id, role: user.role },
            env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({ token, user: userInfo });
    } catch (err) {
        console.error('login error:', err);
        next(err);
    }
};
