const User = require('../models/User');
const Library = require('../models/Library');
const LibrarianApplication = require('../models/LibrarianApplication');

// utils
const normalizePhone = (p = '') => (p || '').toString().replace(/[^\d]/g, '');

// ---------- GET /api/librarian/my-application ----------
exports.getMyApplication = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const appDoc = await LibrarianApplication.findOne({ applicant: userId }).sort({ createdAt: -1 });
        res.json(appDoc || null);
    } catch (e) { next(e); }
};

// ---------- GET /api/librarian/cities ----------
exports.getCities = async (_req, res, next) => {
    try {
        const cities = await User.distinct('city', { city: { $exists: true, $ne: '' } });
        res.json((cities || []).sort());
    } catch (e) { next(e); }
};

// ---------- GET /api/librarian/check-phone?phone=... ----------
exports.checkPhone = async (req, res, next) => {
    try {
        const digits = normalizePhone(req.query.phone || '');
        if (!digits) return res.json({ available: false });
        const taken = await LibrarianApplication.exists({ ownerPhone: digits });
        return res.json({ available: !taken });
    } catch (e) {
        console.error('check-phone error:', e);
        next(e);
    }
};

// ---------- POST /api/librarian/apply ----------
exports.apply = async (req, res, next) => {
    try {
        const userId = req.user.id;
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

        const {
            libraryName, address1, address2 = '',
            zip, ownerPhone, genres, website = '',
            about = '', termsAccepted, motivation
        } = req.body || {};

        const phoneDigits = normalizePhone(ownerPhone);

        // Create application (duplicate phone handled by unique index)
        const appDoc = await LibrarianApplication.create({
            applicant: userId,
            motivation: motivation.trim(),
            status: 'pending',
            libraryName: libraryName.trim(),
            address1: address1.trim(),
            address2: address2.trim(),
            city: cityFromProfile,
            zip: zip.trim(),
            ownerPhone: phoneDigits,
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
        if (err && err.code === 11000 && String(err.message || '').includes('ownerPhone')) {
            return res.status(409).json({ message: 'This phone is already used in another application.' });
        }
        console.error('apply error:', err);
        next(err);
    }
};

// ---------- GET /api/librarian/my-library ----------
exports.getMyLibrary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const me = await User.findById(userId).lean();
        if (!me) return res.status(404).json({ message: 'User not found' });

        // already has a library?
        let lib = await Library.findOne({ owner: userId }).select('_id name').lean();
        if (lib) return res.json(lib);

        // if not librarian yet, check application state
        if (me.role !== 'librarian') {
            const app = await LibrarianApplication.findOne({ applicant: userId }).sort({ createdAt: -1 }).lean();
            if (!app) return res.status(409).json({ code: 'NO_APP', message: 'No librarian application found.' });
            if (app.status === 'pending') return res.status(409).json({ code: 'PENDING', message: 'Your application is pending.' });
            if (app.status === 'rejected') return res.status(409).json({ code: 'REJECTED', message: 'Your application was rejected.' });
            // approved but role not flipped — allow proceeding
        }

        // attempt to create from latest approved application
        const approved = await LibrarianApplication.findOne({ applicant: userId, status: 'approved' })
            .sort({ createdAt: -1 })
            .lean();

        if (!approved) {
            return res.status(409).json({ code: 'NOT_APPROVED', message: 'No approved application to create a library from.' });
        }

        // create library if not exists
        const created = await Library.create({
            owner: userId,
            managers: [userId],
            name: approved.libraryName,
            address1: approved.address1,
            address2: approved.address2 || '',
            city: approved.city,
            zip: approved.zip,
            ownerPhone: approved.ownerPhone,
            website: approved.website || '',
            about: approved.about || '',
            sourceApplication: approved._id
        });

        return res.json({ _id: created._id, name: created.name });
    } catch (e) { next(e); }
};
