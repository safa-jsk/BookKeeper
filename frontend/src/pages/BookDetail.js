import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(res => {
        setBook(res.data);
        setLoading(false);
      })
      .catch(err => {
        setBook(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
  if (!book) return <p className="text-center mt-5">Book not found.</p>;

  return (
    <div className="container mt-4">
      <h2>{book.title}</h2>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Genre:</strong> {book.genre}</p>
      <p><strong>Year:</strong> {book.year}</p>
      <p><strong>Rating:</strong> {book.rating}</p>
      {/* Add more fields as needed, like summary, cover image, reviews */}
      <Link to="/browse" className="btn btn-outline-primary mt-3">Back to Browse</Link>
    </div>
  );
}

export default BookDetail;
