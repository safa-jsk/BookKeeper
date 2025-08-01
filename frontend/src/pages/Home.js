import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import Login from './Login';
import Register from './Register';
import { Link } from 'react-router-dom';

function Home({ onLogin, onRegister }) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      {/* Left Side */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',   // vertical center
          alignItems: 'center',       // horizontal center
          minHeight: '80vh',          // or 100vh for full page
          textAlign: 'center',
          px: 2
        }}
      >
        <Typography variant="h3" gutterBottom>
          Welcome to BookKeeper
        </Typography>
        <Typography variant="h6" gutterBottom>
          Discover and review books.<br />
          Manage your favorite reads.<br />
          See what's trending!
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/browse"
            sx={{ mr: 2, minWidth: 150 }}
          >
            Browse Books
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/trending"
            sx={{ minWidth: 150 }}
          >
            Trending
          </Button>
        </Box>
      </Box>

      {/* Right Side (Auth Panel) */}
      <Paper sx={{ p: 4, minWidth: 380, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant={showLogin ? 'contained' : 'text'}
            onClick={() => setShowLogin(true)}
            sx={{ mr: 2 }}
          >Login</Button>
          <Button
            variant={!showLogin ? 'contained' : 'text'}
            onClick={() => setShowLogin(false)}
          >Register</Button>
        </Box>
        {showLogin ? (
          <Login onLogin={onLogin} />
        ) : (
          <Register onRegister={onRegister} />
        )}
      </Paper>
    </Box>
  );
}

export default Home;
