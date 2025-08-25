const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validations/cart.validation');
const ctrl = require('../controllers/cart.controller');

// View cart
router.get('/', requireAuth, ctrl.getCart);

// Add or update an item
router.post('/items', requireAuth, validate(v.addOrUpdateBody), ctrl.addOrUpdateItem);

// Remove item
router.delete('/items/:bookId', requireAuth, validate(v.bookIdParam, 'params'), ctrl.removeItem);

module.exports = router;
