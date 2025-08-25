const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validations/users.validation');
const ctrl = require('../controllers/users.controller');
const uploadAvatar = require('../middleware/uploadAvatar');

// Category ops
router.post('/books/:bookId/add-to-category',
    requireAuth,
    validate(v.bookIdParam, 'params'),
    validate(v.categoryBody),
    ctrl.addBookToCategory
);

router.post('/books/:bookId/remove-from-category',
    requireAuth,
    validate(v.bookIdParam, 'params'),
    validate(v.categoryBody),
    ctrl.removeBookFromCategory
);

// Profile
router.get('/me', requireAuth, ctrl.getMe);
router.put('/me', requireAuth, validate(v.updateMe), ctrl.updateMe);
router.patch('/me/password', requireAuth, validate(v.changePassword), ctrl.changePassword);

// Avatar
router.post('/me/avatar', requireAuth, uploadAvatar.single('avatar'), ctrl.uploadAvatar);

// Danger zone
router.delete('/me', requireAuth, ctrl.deleteMe);

module.exports = router;
