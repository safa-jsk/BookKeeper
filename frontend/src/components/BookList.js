import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/books') // Adjust if your endpoint differs
      .then(res => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch(err => {
        setBooks([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  if (books.length === 0) return <p className="text-center mt-5">No books found.</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Book List</h2>
      <div className="row">
        {books.map(book => (
          <div key={book._id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{book.title}</h5>
                <p className="card-text"><strong>Author:</strong> {book.author}</p>
                <p className="card-text"><small>{book.genre}</small></p>
                {/* Add more details as needed */}
                <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm mt-2">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;
