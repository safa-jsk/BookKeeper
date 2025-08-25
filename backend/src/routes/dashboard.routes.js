const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validations/dashboard.validation');
const ctrl = require('../controllers/dashboard.controller');

// Overview
router.get('/', requireAuth, ctrl.getOverview);

// Lists
router.get('/want-to-read', requireAuth, ctrl.getWantToRead);
router.get('/currently-reading', requireAuth, ctrl.getCurrentlyReading);
router.get('/finished', requireAuth, ctrl.getFinished);
router.get('/favorites', requireAuth, ctrl.getFavorites);

// Actions
router.patch('/users/me/reading/:bookId/finish',
    requireAuth,
    validate(v.bookIdParam, 'params'),
    ctrl.finishBook
);

module.exports = router;
