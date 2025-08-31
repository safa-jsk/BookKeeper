const router = require('express').Router();
const validate = require('../middleware/validate');
const v = require('../validations/auth.validation');
const ctrl = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', validate(v.register), ctrl.register);

// POST /api/auth/login
router.post('/login', validate(v.login), ctrl.login);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(v.forgotPassword), ctrl.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validate(v.resetPassword), ctrl.resetPassword);

module.exports = router;
