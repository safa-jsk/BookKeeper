import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardMedia, Typography, Button, Grid, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/books/search?query=${query}`);
      setBooks(response.data);
    } catch (err) {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();  // Fetch all books initially
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(searchQuery);  // Fetch books based on search query
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Browse Books
      </Typography>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="search-form mb-4" style={{ textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search by title, author, or genre"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            width: '70%',
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginRight: '10px'
          }}
        />
        <Button variant="contained" color="primary" type="submit" sx={{ padding: '10px 20px' }}>
          Search
        </Button>
      </form>

      {/* Book Grid */}
      <Grid container spacing={3}>
        {books.length === 0 && !loading && <Typography variant="h6" align="center">No books found.</Typography>}
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id} sx={{ marginBottom: 4 }}>
            <Card sx={{ maxWidth: 345, height: '100%' }}>
              <CardMedia
                component="img"
                height="200"
                image={book.image || '/default-book-cover.jpg'}
                alt={book.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Author:</strong> {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Genre:</strong> {book.genre}
                </Typography>
              </CardContent>
              <Button size="small" component={Link} to={`/books/${book._id}`} color="primary">
                View Details
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default BookList;
