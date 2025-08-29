const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validations/admin.validation');
const ctrl = require('../controllers/admin.controller');
const reqCtrl = require('../controllers/requests.controller');

// GET /api/admin/librarian-applications?status=pending|approved|rejected
router.get(
    '/librarian-applications',
    requireAuth,
    requireAdmin,
    validate(v.listAppsQuery, 'query'),
    ctrl.listLibrarianApplications
);

// PATCH /api/admin/librarian-applications/:id
// body: { decision: 'approve' | 'reject', reviewNote?: string }
router.patch(
    '/librarian-applications/:id',
    requireAuth,
    requireAdmin,
    validate(v.decideBody),
    ctrl.decideLibrarianApplication
);

// ----- Admin CRUD: Users -----
router.get('/users', requireAuth, requireAdmin, ctrl.adminListUsers);
router.post('/users', requireAuth, requireAdmin, ctrl.adminCreateUser);
router.put('/users/:id', requireAuth, requireAdmin, ctrl.adminUpdateUser);
router.delete('/users/:id', requireAuth, requireAdmin, ctrl.adminDeleteUser);

// ----- Admin CRUD: Books -----
router.get('/books', requireAuth, requireAdmin, ctrl.adminListBooks);
router.post('/books', requireAuth, requireAdmin, ctrl.adminCreateBook);
router.put('/books/:id', requireAuth, requireAdmin, ctrl.adminUpdateBook);
router.delete('/books/:id', requireAuth, requireAdmin, ctrl.adminDeleteBook);

// ----- Admin CRUD: Libraries -----
router.get('/libraries', requireAuth, requireAdmin, ctrl.adminListLibraries);
router.post('/libraries', requireAuth, requireAdmin, ctrl.adminCreateLibrary);
router.put('/libraries/:id', requireAuth, requireAdmin, ctrl.adminUpdateLibrary);
router.delete('/libraries/:id', requireAuth, requireAdmin, ctrl.adminDeleteLibrary);

// ----- Admin CRUD: Inventories -----
router.get('/inventories', requireAuth, requireAdmin, ctrl.adminListInventories);
router.post('/inventories', requireAuth, requireAdmin, ctrl.adminCreateInventory);
router.put('/inventories/:id', requireAuth, requireAdmin, ctrl.adminUpdateInventory);
router.delete('/inventories/:id', requireAuth, requireAdmin, ctrl.adminDeleteInventory);

// ----- Admin: Manage Requests (global) -----
// List all requests (optional filter by status)
router.get('/requests', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;
        const list = await require('../models/Request')
            .find(query)
            .populate('user', 'firstName lastName email')
            .populate('library', 'name')
            .populate('items.book', 'title author')
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (e) { next(e); }
});

// Approve, Reject, Delay, or Delete any request as admin
router.patch('/requests/:id/approve', requireAuth, requireAdmin, async (req, res, next) => {
    // Reuse librarian approve by spoofing params
    req.params.libraryId = (await require('../models/Request').findById(req.params.id).select('library').lean()).library;
    return require('../controllers/requests.controller').approve(req, res, next);
});
router.patch('/requests/:id/reject', requireAuth, requireAdmin, (req, res, next) => {
    req.params.libraryId = undefined; // not needed in controller when using _id only, but kept for signature
    return require('../controllers/requests.controller').reject(req, res, next);
});
router.patch('/requests/:id/delay', requireAuth, requireAdmin, (req, res, next) => {
    req.params.libraryId = undefined;
    return require('../controllers/requests.controller').delay(req, res, next);
});
router.delete('/requests/:id', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const Request = require('../models/Request');
        const doc = await Request.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Request not found' });
        res.json({ ok: true });
    } catch (e) { next(e); }
});

module.exports = router;
