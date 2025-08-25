const router = require('express').Router();
const validate = require('../middleware/validate');
const v = require('../validations/book.validation');
const ctrl = require('../controllers/books.controller');

// Search
router.get('/search', validate(v.searchQuery, 'query'), ctrl.search);

// List all
router.get('/', ctrl.list);

// Get one
router.get('/:id', validate(v.bookIdParam, 'params'), ctrl.getOne);

// Add review
router.post('/:id/reviews', validate(v.bookIdParam, 'params'), validate(v.addReview), ctrl.addReview);

// List reviews
router.get('/:id/reviews', validate(v.bookIdParam, 'params'), ctrl.listReviews);

module.exports = router;
