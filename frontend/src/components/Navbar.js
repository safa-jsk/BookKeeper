// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Box, Container, Menu, MenuItem, IconButton, Badge
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Navbar({ user, onLogout }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // restore user if not passed
  let effectiveUser = user;
  if (!effectiveUser) {
    try {
      const u = localStorage.getItem('user');
      if (u && u !== 'undefined') effectiveUser = JSON.parse(u);
    } catch { }
  }

  const role = effectiveUser?.role || 'reader';

  const goToRoleHome = async () => {
    setAnchorEl(null);
    if (role === 'admin') {
      navigate('/admin');
      return;
    }
    if (role === 'librarian') {
      // resolve own libraryId once
      let libraryId = localStorage.getItem('myLibraryId') || '';
      try {
        if (!libraryId) {
          const r = await axios.get(`${API}/api/librarian/my-library`, authHeader());
          libraryId = r?.data?._id || '';
          if (libraryId) localStorage.setItem('myLibraryId', libraryId);
        }
      } catch { }
      navigate('/dashboard'); // dashboard (drawer contains extra librarian pages)
      return;
    }
    navigate('/dashboard'); // reader
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0 2px 8px rgba(75,61,45,0.06)',
        zIndex: (theme) => theme.zIndex.drawer + 1   // <-- keeps AppBar above Drawer
      }} >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72 }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 3 }}>
            <img src="/images/logo_w.png" alt="BookKeeper" style={{ height: 44, objectFit: 'contain' }} />
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/browse" sx={{ textTransform: 'none' }}>Browse Books</Button>
            <Button color="inherit" component={Link} to="/trending" sx={{ textTransform: 'none' }}>Trending</Button>
            <Button color="inherit" component={Link} to="/map" sx={{ textTransform: 'none' }}>Map</Button>
          </Box>

          {/* User dropdown */}
          {effectiveUser && (
            <>
              <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ fontWeight: 500 }}>
                Welcome, {effectiveUser.firstName}
              </Button>
              <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={goToRoleHome}>
                  {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </MenuItem>
                <MenuItem component={Link} to="/dashboard/account-settings" onClick={() => setAnchorEl(null)}>
                  Account Settings
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Cart icon */}
          <IconButton color="inherit" component={Link} to="/cart" aria-label="Cart" sx={{ mr: 1 }}>
            <Badge color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

        </Toolbar>
      </Container>
    </AppBar>
  );
}
