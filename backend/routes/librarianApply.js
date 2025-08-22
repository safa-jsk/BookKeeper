// routes/librarianApply.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const LibrarianApplication = require('../models/LibrarianApplication');
const User = require('../models/User');

// utils
const normalizePhone = (p = '') => (p || '').toString().replace(/[^\d]/g, '');

// ---------- GET /api/librarian/my-application ----------
router.get('/my-application', requireAuth, async (req, res) => {
    const userId = req.user.id; // token has "id"
    const appDoc = await LibrarianApplication.findOne({ applicant: userId }).sort({ createdAt: -1 });
    res.json(appDoc || null);
});

// ---------- GET /api/librarian/cities ----------
router.get('/cities', requireAuth, async (_req, res) => {
    const cities = await User.distinct('city', { city: { $exists: true, $ne: '' } });
    res.json((cities || []).sort());
});

// ---------- GET /api/librarian/check-phone?phone=... ----------
router.get('/check-phone', requireAuth, async (req, res) => {
    try {
        const digits = normalizePhone(req.query.phone || '');
        if (!digits) return res.json({ available: false });
        const taken = await LibrarianApplication.exists({ ownerPhone: digits });
        return res.json({ available: !taken });
    } catch (e) {
        console.error('check-phone error:', e);
        return res.status(500).json({ message: 'Server error checking phone' });
    }
});

// ---------- POST /api/librarian/apply ----------
router.post('/apply', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; // IMPORTANT: token provides "id", not "_id"
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Block already-elevated users
        if (['librarian', 'admin'].includes(user.role)) {
            return res.status(400).json({ message: 'You already have elevated privileges.' });
        }

        // Prevent duplicate pending applications
        const existing = await LibrarianApplication.findOne({ applicant: userId, status: 'pending' });
        if (existing) return res.status(409).json({ message: 'An application is already pending.' });

        // City must come from user profile
        const cityFromProfile = (user.city || '').trim();
        if (!cityFromProfile) {
            return res.status(400).json({ message: 'Please set your City in your profile before applying.' });
        }

        // Extract & validate payload
        const {
            libraryName,
            address1,
            address2 = '',
            zip,
            ownerPhone,
            genres,
            website = '',
            about = '',
            termsAccepted,
            motivation
        } = req.body || {};

        if (!libraryName || libraryName.trim().length < 2)
            return res.status(400).json({ message: 'Library name is required (min 2 chars).' });

        if (!address1 || address1.trim().length < 3)
            return res.status(400).json({ message: 'Address Line 1 is required (min 3 chars).' });

        if (!zip || zip.trim().length < 3)
            return res.status(400).json({ message: 'ZIP / Postal Code is required (min 3 chars).' });

        const phoneDigits = normalizePhone(ownerPhone);
        if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15)
            return res.status(400).json({ message: 'Owner phone must be 10–15 digits.' });

        if (!Array.isArray(genres) || genres.filter(Boolean).length < 3)
            return res.status(400).json({ message: 'Select at least 3 genres.' });

        if (!termsAccepted)
            return res.status(400).json({ message: 'You must accept the terms.' });

        if (!motivation || motivation.trim().length === 0)
            return res.status(400).json({ message: 'Motivation is required.' });

        // Create application (handle duplicate phone gracefully)
        const appDoc = await LibrarianApplication.create({
            applicant: userId,
            motivation: motivation.trim(),
            status: 'pending',
            libraryName: libraryName.trim(),
            address1: address1.trim(),
            address2: address2.trim(),
            city: cityFromProfile,     // enforce from profile
            zip: zip.trim(),
            ownerPhone: phoneDigits,   // normalized form
            genres,
            website: website.trim(),
            about: about.trim(),
            termsAccepted: !!termsAccepted
        });

        // Reflect 'pending' on user
        user.librarianApplicationStatus = 'pending';
        await user.save();

        return res.status(201).json({ ok: true, id: appDoc._id });
    } catch (err) {
        // Duplicate key on ownerPhone index
        if (err && err.code === 11000 && String(err.message || '').includes('ownerPhone')) {
            return res.status(409).json({ message: 'This phone is already used in another application.' });
        }
        console.error('apply error:', err);
        return res.status(500).json({ message: 'Server error during application.' });
    }
});

module.exports = router;
