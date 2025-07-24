const express = require('express');
const Book = require('../models/Book');
const Review = require('../models/Review');
const mongoose = require('mongoose');  // Added for ObjectId validation
const router = express.Router();

// Search books by title, author, or genre
router.get('/search', async (req, res) => {
  const { query } = req.query;  // Get the search query from the query parameters

  try {
    let books;
    if (query) {
      // Search for books if there's a query
      books = await Book.find({
        $or: [
          { title: { $regex: query, $options: 'i' } }, // Case-insensitive search for title
          { author: { $regex: query, $options: 'i' } }, // Case-insensitive search for author
          { genre: { $regex: query, $options: 'i' } },  // Case-insensitive search for genre
        ]
      });
    } else {
      // Fetch all books if no query is provided (default behavior)
      books = await Book.find();
    }

    res.json(books);  // Return the search results or all books
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
