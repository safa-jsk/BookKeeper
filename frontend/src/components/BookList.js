import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');  // State for the search query
  const [loading, setLoading] = useState(true);

  // Fetch books (either all or based on search query)
  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      // If there's no query, fetch all books; otherwise, search for books
      const response = await axios.get(`http://localhost:5000/api/books/search?query=${query}`);
      setBooks(response.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchBooks();  // Fetch all books initially (empty query)
  }, []);  // Fetch all books on initial load

  // Handle the search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(searchQuery);  // Fetch books based on the search query
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Browse Books</h2>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}  // Update search query
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="row mt-4">
        {books.length === 0 ? (
          <p className="text-center">No books found.</p>
        ) : (
          books.map((book) => (
            <div key={book._id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text"><strong>Author:</strong> {book.author}</p>
                  <p className="card-text"><small>{book.genre}</small></p>
                  <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm mt-2">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookList;
