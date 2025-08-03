import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';

function Navbar({ user, onLogout }) {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#4B3D2D',
        boxShadow: '0 2px 8px rgba(75,61,45,0.06)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72 }}>
          {/* Logo on Left */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: 3
            }}
          >
            <img
              src="/images/logo_w.png"
              alt="BookKeeper"
              style={{
                height: 44,
                width: 'auto',
                marginRight: 8,
                objectFit: 'contain'
              }}
            />
          </Box>

          {/* Nav Buttons */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/browse"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                textTransform: 'none',
                color: '#E3D4B9',
                '&:hover': { color: '#C2B280' }
              }}
            >
              Browse Books
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/trending"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                textTransform: 'none',
                color: '#E3D4B9',
                '&:hover': { color: '#C2B280' }
              }}
            >
              Trending
            </Button>
          </Box>

          {/* User Info & Logout */}
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ color: '#E3D4B9', fontWeight: 500 }}>
                Welcome, {user.firstName}
              </span>
              <Button
                variant="outlined"
                onClick={onLogout}
                sx={{
                  color: '#4B3D2D',
                  borderColor: '#C2B280',
                  backgroundColor: '#E3D4B9',
                  '&:hover': {
                    backgroundColor: '#C2B280'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          ) : null}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
