// routes/librarianApply.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const LibrarianApplication = require('../models/LibrarianApplication');
const User = require('../models/User');

// POST /api/librarian/apply
router.post('/apply', requireAuth, async (req, res) => {
    const { motivation, attachments = [] } = req.body;

    // Block librarians/admins from reapplying
    if (['librarian', 'admin'].includes(req.user.role)) {
        return res.status(400).json({ message: 'You already have elevated privileges.' });
    }

    // Prevent duplicate pending applications
    const existing = await LibrarianApplication.findOne({ applicant: req.user._id, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'An application is already pending.' });

    const appDoc = await LibrarianApplication.create({
        applicant: req.user._id,
        motivation,
        attachments
    });

    await User.findByIdAndUpdate(req.user._id, { librarianApplicationStatus: 'pending' });
    res.status(201).json(appDoc);
});

// GET /api/librarian/my-application
router.get('/my-application', requireAuth, async (req, res) => {
    const appDoc = await LibrarianApplication.findOne({ applicant: req.user._id }).sort({ createdAt: -1 });
    res.json(appDoc);
});

module.exports = router;
