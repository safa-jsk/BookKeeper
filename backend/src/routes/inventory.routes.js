const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { canManageLibrary } = require('../middleware/libraryGuard');
const validate = require('../middleware/validate');
const v = require('../validations/inventory.validation');
const ctrl = require('../controllers/inventory.controller');

// Add / Increase
router.post('/:libraryId/inventory/add',
    requireAuth, canManageLibrary(),
    validate(v.paramsWithLibraryId, 'params'),
    validate(v.addOrIncrease),
    ctrl.addOrIncrease
);

// Decrease
router.patch('/:libraryId/inventory/:bookId/decrease',
    requireAuth, canManageLibrary(),
    validate(v.paramsWithLibAndBook, 'params'),
    validate(v.decrease),
    ctrl.decrease
);

// List mine
router.get('/:libraryId/inventory',
    requireAuth, canManageLibrary(),
    validate(v.paramsWithLibraryId, 'params'),
    ctrl.listMine
);

// Catalog
router.get('/:libraryId/inventory/catalog',
    requireAuth, canManageLibrary(),
    validate(v.paramsWithLibraryId, 'params'),
    ctrl.catalog
);

// Set Price
router.patch('/:libraryId/inventory/:bookId/price',
    requireAuth, canManageLibrary(),
    validate(v.paramsWithLibAndBook, 'params'),
    validate(v.setPrice),
    ctrl.setPrice
);


module.exports = router;
