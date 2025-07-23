const express = require('express');
const Book = require('../models/Book');
const router = express.Router();

router.get('/', async (req, res) => {
  const books = await Book.find({});
  res.json(books);
});

module.exports = router;

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});