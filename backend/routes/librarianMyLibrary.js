// routes/librarianMyLibrary.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const Library = require('../models/Library');
const LibrarianApplication = require('../models/LibrarianApplication');
const User = require('../models/User');

// GET /api/librarian/my-library
// - returns { _id, name } if found/created
// - 409 if user not librarian / app pending / app not found
router.get('/my-library', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const me = await User.findById(userId).lean();
    if (!me) return res.status(404).json({ message: 'User not found' });

    // already has a library?
    let lib = await Library.findOne({ owner: userId }).select('_id name').lean();
    if (lib) return res.json(lib);

    // if not librarian yet, see if we can “upgrade” from an approved application
    if (me.role !== 'librarian') {
        const app = await LibrarianApplication.findOne({ applicant: userId }).sort({ createdAt: -1 }).lean();
        if (!app) return res.status(409).json({ code: 'NO_APP', message: 'No librarian application found.' });
        if (app.status === 'pending') return res.status(409).json({ code: 'PENDING', message: 'Your application is pending.' });
        if (app.status === 'rejected') return res.status(409).json({ code: 'REJECTED', message: 'Your application was rejected.' });
        // approved but user.role not flipped? (safety)
        // don’t block; proceed to create library below
    }

    // attempt to create from the latest approved application
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
});

module.exports = router;
