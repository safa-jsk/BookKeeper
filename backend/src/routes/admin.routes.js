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

module.exports = router;
