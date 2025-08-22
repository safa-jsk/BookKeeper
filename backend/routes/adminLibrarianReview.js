// routes/adminLibrarianReview.js
const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const LibrarianApplication = require('../models/LibrarianApplication');
const User = require('../models/User');
const Library = require('../models/Library'); // NEW: create a Library on approval

// GET /api/admin/librarian-applications?status=pending|approved|rejected
router.get('/librarian-applications', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const apps = await LibrarianApplication.find({ status })
            .populate('applicant', 'firstName lastName email role city librarianApplicationStatus')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (e) {
        console.error('List applications failed:', e);
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
});

// PATCH /api/admin/librarian-applications/:id
// body: { decision: 'approve' | 'reject', reviewNote?: string }
router.patch('/librarian-applications/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { decision, reviewNote } = req.body;
        if (!['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ message: 'Invalid decision.' });
        }

        const appDoc = await LibrarianApplication.findById(req.params.id);
        if (!appDoc || appDoc.status !== 'pending') {
            return res.status(404).json({ message: 'Pending application not found.' });
        }

        // 1) Update application document
        appDoc.status = decision === 'approve' ? 'approved' : 'rejected';
        appDoc.reviewedBy = req.user.id;           // set by requireAuth earlier
        appDoc.reviewedAt = new Date();
        appDoc.reviewNote = reviewNote;
        await appDoc.save();

        // 2) Update user role/status
        const newRole = decision === 'approve' ? 'librarian' : 'reader';
        const newStatus = decision === 'approve' ? 'approved' : 'rejected';
        await User.findByIdAndUpdate(appDoc.applicant, {
            role: newRole,
            librarianApplicationStatus: newStatus
        });

        // 3) On approval, create a Library for this applicant (if it doesn’t already exist)
        let createdLibrary = null;
        if (decision === 'approve') {
            // Ensure we don’t duplicate the same (owner, name)
            const existing = await Library.findOne({
                owner: appDoc.applicant,
                name: appDoc.libraryName
            });

            if (!existing) {
                createdLibrary = await Library.create({
                    owner: appDoc.applicant,
                    managers: [appDoc.applicant], // allow self-management
                    name: appDoc.libraryName,
                    address1: appDoc.address1,
                    address2: appDoc.address2,
                    city: appDoc.city,
                    zip: appDoc.zip,
                    ownerPhone: appDoc.ownerPhone,
                    website: appDoc.website,
                    about: appDoc.about,
                    sourceApplication: appDoc._id
                });
            }
        }

        return res.json({
            ok: true,
            status: appDoc.status,
            message: `Application ${appDoc.status}.`,
            library: createdLibrary
                ? {
                    _id: createdLibrary._id,
                    name: createdLibrary.name,
                    address1: createdLibrary.address1,
                    address2: createdLibrary.address2,
                    city: createdLibrary.city,
                    zip: createdLibrary.zip
                }
                : undefined
        });
    } catch (e) {
        console.error('Decision failed:', e);
        res.status(500).json({ message: 'Failed to decide application' });
    }
});

module.exports = router;
