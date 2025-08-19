// routes/adminLibrarianReview.js
const router = require('express').Router();
const { requireRole } = require('../middleware/auth');
const LibrarianApplication = require('../models/LibrarianApplication');
const User = require('../models/User');

// GET /api/admin/librarian-applications?status=pending|approved|rejected
router.get('/librarian-applications', requireRole('admin'), async (req, res) => {
    const { status = 'pending' } = req.query;
    const apps = await LibrarianApplication.find({ status })
        .populate('applicant', 'name email role')
        .sort({ createdAt: -1 });
    res.json(apps);
});

// PATCH /api/admin/librarian-applications/:id
router.patch('/librarian-applications/:id', requireRole('admin'), async (req, res) => {
    const { decision, reviewNote } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ message: 'Invalid decision.' });
    }

    const appDoc = await LibrarianApplication.findById(req.params.id);
    if (!appDoc || appDoc.status !== 'pending') {
        return res.status(404).json({ message: 'Pending application not found.' });
    }

    // Update application
    appDoc.status = decision === 'approve' ? 'approved' : 'rejected';
    appDoc.reviewedBy = req.user._id;
    appDoc.reviewedAt = new Date();
    appDoc.reviewNote = reviewNote;
    await appDoc.save();

    // Update user
    const newRole = decision === 'approve' ? 'librarian' : 'reader';
    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    await User.findByIdAndUpdate(appDoc.applicant, {
        role: newRole,
        librarianApplicationStatus: newStatus
    });

    res.json({ message: `Application ${appDoc.status}.` });
});
module.exports = router;
