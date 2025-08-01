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
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
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
      <Grid
        container
        spacing={3}
        justifyContent="center" // <-- This centers the book grid!
      >
        {books.length === 0 && !loading && (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">No books found.</Typography>
          </Grid>
        )}
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book._id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ width: 260, height: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', m: 'auto' }}>
              <CardMedia
                component="img"
                height="200"
                image={book.image || '/default-book-cover.jpg'}
                alt={book.title}
                sx={{ objectFit: 'cover', width: '100%' }}
              />
              <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                <Typography gutterBottom variant="h6" component="div" align="center">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  <strong>Author:</strong> {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
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
