const router = require('express').Router();
const ctrl = require('../controllers/libraries.controller');

// Public endpoint for map to fetch library locations
router.get('/locations', ctrl.listLocations);

module.exports = router;


