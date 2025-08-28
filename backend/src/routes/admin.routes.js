const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validations/admin.validation');
const ctrl = require('../controllers/admin.controller');

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

module.exports = router;
