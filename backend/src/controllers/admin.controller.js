const LibrarianApplication = require('../models/LibrarianApplication');
const User = require('../models/User');
const Library = require('../models/Library');
const Book = require('../models/Book');

/**
 * GET /api/admin/librarian-applications?status=pending|approved|rejected
 */
exports.listLibrarianApplications = async (req, res, next) => {
    try {
        const { status = 'pending' } = req.query;
        const apps = await LibrarianApplication.find({ status })
            .populate('applicant', 'firstName lastName email role city librarianApplicationStatus')
            .sort({ createdAt: -1 });

        res.json(apps);
    } catch (e) {
        console.error('List applications failed:', e);
        next(e);
    }
};

// ---- Admin CRUD: Users ----
exports.adminListUsers = async (_req, res, next) => {
    try {
        const users = await User.find().lean();
        res.json(users);
    } catch (e) { next(e); }
};

exports.adminCreateUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        const { password, ...safe } = user.toObject();
        res.status(201).json(safe);
    } catch (e) { next(e); }
};

exports.adminUpdateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, req.body, { new: true }).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...safe } = user;
        res.json(safe);
    } catch (e) { next(e); }
};

exports.adminDeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ ok: true });
    } catch (e) { next(e); }
};

// ---- Admin CRUD: Books ----
exports.adminListBooks = async (_req, res, next) => {
    try { res.json(await Book.find().lean()); } catch (e) { next(e); }
};
exports.adminCreateBook = async (req, res, next) => {
    try { const b = await Book.create(req.body); res.status(201).json(b); } catch (e) { next(e); }
};
exports.adminUpdateBook = async (req, res, next) => {
    try { const b = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!b) return res.status(404).json({ message: 'Book not found' }); res.json(b); } catch (e) { next(e); }
};
exports.adminDeleteBook = async (req, res, next) => {
    try { await Book.findByIdAndDelete(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
};

// ---- Admin CRUD: Libraries ----
exports.adminListLibraries = async (_req, res, next) => {
    try { res.json(await Library.find().lean()); } catch (e) { next(e); }
};
exports.adminCreateLibrary = async (req, res, next) => {
    try { const lib = await Library.create(req.body); res.status(201).json(lib); } catch (e) { next(e); }
};
exports.adminUpdateLibrary = async (req, res, next) => {
    try { const lib = await Library.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!lib) return res.status(404).json({ message: 'Library not found' }); res.json(lib); } catch (e) { next(e); }
};
exports.adminDeleteLibrary = async (req, res, next) => {
    try { await Library.findByIdAndDelete(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
};

/**
 * PATCH /api/admin/librarian-applications/:id
 * body: { decision: 'approve' | 'reject', reviewNote?: string }
 */
exports.decideLibrarianApplication = async (req, res, next) => {
    try {
        const { decision, reviewNote } = req.body;

        const appDoc = await LibrarianApplication.findById(req.params.id);
        if (!appDoc || appDoc.status !== 'pending') {
            return res.status(404).json({ message: 'Pending application not found.' });
        }

        // 1) Update application
        appDoc.status = decision === 'approve' ? 'approved' : 'rejected';
        appDoc.reviewedBy = req.user.id;
        appDoc.reviewedAt = new Date();
        appDoc.reviewNote = reviewNote;
        await appDoc.save();

        // 2) Update user role/status
        const newRole = decision === 'approve' ? 'librarian' : 'reader';
        const newStatus = decision === 'approve' ? 'approved' : 'rejected';
        await User.findByIdAndUpdate(appDoc.applicant, {
            role: newRole,
            librarianApplicationStatus: newStatus,
        });

        // 3) On approval, create Library once
        let createdLibrary = null;
        if (decision === 'approve') {
            const existing = await Library.findOne({
                owner: appDoc.applicant,
                name: appDoc.libraryName,
            });

            if (!existing) {
                createdLibrary = await Library.create({
                    owner: appDoc.applicant,
                    managers: [appDoc.applicant],
                    name: appDoc.libraryName,
                    address1: appDoc.address1,
                    address2: appDoc.address2,
                    city: appDoc.city,
                    zip: appDoc.zip,
                    ownerPhone: appDoc.ownerPhone,
                    website: appDoc.website,
                    about: appDoc.about,
                    sourceApplication: appDoc._id,
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
                    zip: createdLibrary.zip,
                }
                : undefined,
        });
    } catch (e) {
        console.error('Decision failed:', e);
        next(e);
    }
};
