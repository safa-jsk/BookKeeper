const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validations/librarian.validation');
const ctrl = require('../controllers/librarian.controller');

// Application
router.get('/my-application', requireAuth, ctrl.getMyApplication);
router.get('/cities', requireAuth, ctrl.getCities);
router.get('/check-phone', requireAuth, validate(v.checkPhoneQuery, 'query'), ctrl.checkPhone);
router.post('/apply', requireAuth, validate(v.applyBody), ctrl.apply);

// Library
router.get('/my-library', requireAuth, ctrl.getMyLibrary);

module.exports = router;
