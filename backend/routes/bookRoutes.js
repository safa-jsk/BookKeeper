const express = require('express');
const Book = require('../models/Book');
const Review = require('../models/Review');
const mongoose = require('mongoose');  // Added for ObjectId validation
const router = express.Router();

// Search books by title, author, or genre
// In bookRoutes.js
router.get('/search', async (req, res) => {
  const { query, filter } = req.query;
  try {
    let books;
    if (!query) {
      books = await Book.find();
    } else if (!filter || filter === 'none') {
      // Default: search across all
      books = await Book.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { genre: { $regex: query, $options: 'i' } }
        ]
      });
    } else if (filter === 'title') {
      books = await Book.find({ title: { $regex: query, $options: 'i' } });
    } else if (filter === 'author') {
      books = await Book.find({ author: { $regex: query, $options: 'i' } });
    } else if (filter === 'genre') {
      books = await Book.find({ genre: { $regex: query, $options: 'i' } });
    } else if (filter === 'rating') {
      // For rating, treat query as minimum rating
      const minRating = parseFloat(query) || 0;
      books = await Book.find({ rating: { $gte: minRating } });
    } else {
      books = await Book.find();
    }
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Server error while searching books' });
  }
});


// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();  // Fetch all books
    res.json(books);                  // Return the books as JSON
  } catch (err) {
    res.status(500).json({ error: 'Error fetching books' });
  }
});

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews');  // Ensure reviews are populated
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);  // Send back the populated book data
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Add review for a book
router.post('/:id/reviews', async (req, res) => {
  const { user, rating, comment } = req.body;
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const review = new Review({
      user,
      rating,
      comment
    });
    await review.save();

    // Push the newly created review's ObjectId to the book's reviews array
    book.reviews.push(review._id);  // Save review reference in book
    book.rating = await calculateAverageRating(book._id);  // Recalculate average rating for the book
    await book.save();

    // Return updated book with reviews
    await book.populate('reviews');
    res.json(book);  // Return updated book with all reviews
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Helper function to calculate the average rating for a book
async function calculateAverageRating(bookId) {
  const book = await Book.findById(bookId).populate('reviews');
  const reviews = book.reviews;  // All the populated reviews

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  return totalRating / reviews.length;  // Return average rating
}

// Get reviews for a book
router.get('/:id/reviews', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews');  // Populate reviews for the book
    if (!book) return res.status(404).json({ error: 'Book not found' });

    res.json(book.reviews);  // Return reviews
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
