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
      rating: Number(rating),
      comment
    });
    await review.save();

    // Push just the ObjectId
    book.reviews.push(review._id);
    await book.save();

    // IMPORTANT: re-fetch book to ensure reviews are up-to-date
    const updatedBook = await Book.findById(book._id).populate('reviews');

    // Recalculate average on the latest reviews
    updatedBook.rating = await calculateAverageRating(updatedBook._id);
    await updatedBook.save();

    res.json(updatedBook);  // Return updated book with all reviews
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Helper function to calculate the average rating for a book
async function calculateAverageRating(bookId) {
  const book = await Book.findById(bookId).populate('reviews');
  if (!book || !book.reviews.length) return 0;

  // Only count reviews that exist (filter out nulls)
  const validReviews = book.reviews.filter(r => r && typeof r.rating === 'number');
  if (!validReviews.length) return 0;
  console.log('Valid reviews:', validReviews);

  const avg = validReviews.reduce((acc, r) => acc + Number(r.rating), 0) / validReviews.length;
  console.log('Calculated average rating:', avg);
  return avg || 0;
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
