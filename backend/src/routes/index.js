const router = require('express').Router();

// /api/books/*
router.use('/books', require('./books.routes'));

// /api/auth/*
router.use('/auth', require('./auth.routes'));

// /api/dashboard/*
router.use('/dashboard', require('./dashboard.routes'));

// /api/user/*
router.use('/user', require('./users.routes'));

// /api/librarian/*  (applications + my-library)
router.use('/librarian', require('./librarian.routes'));

// /api/admin/*      (review librarian apps)
router.use('/admin', require('./admin.routes'));

// /api/librarian/*  (inventory)
router.use('/librarian', require('./inventory.routes'));

// /api/cart/*
router.use('/cart', require('./cart.routes'));

// /api/requests/*
router.use('/requests', require('./request.routes'));

// /api/libraries/* (public locations for map)
router.use('/libraries', require('./libraries.routes'));

module.exports = router;
