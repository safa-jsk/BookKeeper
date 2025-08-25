const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { canManageLibrary } = require('../middleware/libraryGuard');
const validate = require('../middleware/validate');
const v = require('../validations/request.validation');
const ctrl = require('../controllers/requests.controller');

// User creates a request to a specific library
router.post('/',
    requireAuth,
    validate(v.createBody),
    ctrl.create
);

// Librarian sees requests for their library
router.get('/librarian/:libraryId/requests',
    requireAuth,
    requireRole('librarian', 'admin'),
    canManageLibrary(),
    validate(v.paramsLib, 'params'),
    validate(v.statusQuery, 'query'),
    ctrl.listForLibrary
);

// Approve a request (transactional stock decrement)
router.patch('/librarian/:libraryId/requests/:id/approve',
    requireAuth,
    requireRole('librarian', 'admin'),
    canManageLibrary(),
    validate(v.paramsLibAndReq, 'params'),
    ctrl.approve
);

// Reject a request
router.patch('/librarian/:libraryId/requests/:id/reject',
    requireAuth,
    requireRole('librarian', 'admin'),
    canManageLibrary(),
    validate(v.paramsLibAndReq, 'params'),
    validate(v.rejectBody),
    ctrl.reject
);

module.exports = router;
