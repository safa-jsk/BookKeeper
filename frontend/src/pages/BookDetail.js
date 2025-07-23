import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function BookDetail() {
  const { id } = useParams();  // This grabs the 'id' from the URL
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);  // State for reviews
  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });  // State for new review form
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the book details and reviews using the id from URL
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(res => {
        setBook(res.data);
        setReviews(res.data.reviews || []);  // Set reviews from the book object (if available)
        setLoading(false);
      })
      .catch(err => {
        setBook(null);
        setLoading(false);
      });
  }, [id]);  // Fetch again if the id changes

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    // POST the new review to the backend
    axios.post(`http://localhost:5000/api/books/${id}/reviews`, newReview)
      .then(res => {
        setBook(res.data);  // Update book data (including new review)
        setReviews(res.data.reviews);  // Update reviews with the new review added
        setNewReview({ user: '', rating: 5, comment: '' });  // Reset the form
      })
      .catch(err => {
        alert('Error submitting review.');
      });
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
  if (!book) return <p className="text-center mt-5">Book not found.</p>;

  return (
    <div className="container mt-4">
      <h2>{book.title}</h2>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Genre:</strong> {book.genre}</p>
      <p><strong>Year:</strong> {book.year}</p>
      <p><strong>Rating:</strong> {book.rating}</p>

      <h3>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((review, index) => (
            <li key={index}>
              <p><strong>{review.user}</strong> rated it {review.rating} / 5</p>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}


      <h4>Add a Review</h4>
      <form onSubmit={handleReviewSubmit}>
        <div className="mb-3">
          <label htmlFor="user" className="form-label">Your Name</label>
          <input
            type="text"
            id="user"
            className="form-control"
            value={newReview.user}
            onChange={e => setNewReview({ ...newReview, user: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="rating" className="form-label">Rating</label>
          <input
            type="number"
            id="rating"
            className="form-control"
            value={newReview.rating}
            onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
            min="1" max="5"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="comment" className="form-label">Your Review</label>
          <textarea
            id="comment"
            className="form-control"
            value={newReview.comment}
            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit Review</button>
      </form>

      <Link to="/browse" className="btn btn-outline-primary mt-3">Back to Browse</Link>
    </div>
  );
}

export default BookDetail;
