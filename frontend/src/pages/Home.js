import React, { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Button, Grid, Paper, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

function Home({ onLogin, user }) {
  const theme = useTheme();
  const [selectedForm, setSelectedForm] = useState('login');

  const isLoggedIn = useMemo(() => {
    if (user) return true;
    try {
      const savedUser = localStorage.getItem('user');
      return !!(savedUser && savedUser !== 'undefined');
    } catch { return false; }
  }, [user]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',          // vertical centering
        justifyContent: 'center',      // horizontal centering
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 4 }
      }}
    >
      {/* Constrain overall width and keep content centered */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          {/* LEFT: hero tile (centers even when alone) */}
          <Grid
            item
            xs={12}
            md={isLoggedIn ? 8 : 6}     // slightly narrower than full to keep nice centering
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Paper
              elevation={6}
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 3,
                width: '100%',
                maxWidth: 540,          // prevents stretching; keeps it as a centered tile
                textAlign: 'center'
              }}
            >
              <Typography variant="h2" sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 2 }}>
                Welcome to
              </Typography>
              <img src="/images/logo_brown.png" alt="BookKeeper Logo" style={{ height: 100, marginBottom: 16 }} />
              <Typography variant="h5" sx={{ color: theme.palette.secondary.main, mb: 4 }}>
                Your AI-powered library companion.
              </Typography>
              <Box>
                <Button
                  component={Link}
                  to="/browse"
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    px: 4, py: 1.5, fontSize: 20, borderRadius: 2,
                    '&:hover': { bgcolor: theme.palette.secondary.main, borderColor: theme.palette.primary.main }
                  }}
                >
                  Browse Books
                </Button>
                <Button
                  component={Link}
                  to="/trending"
                  size="large"
                  variant="outlined"
                  sx={{
                    ml: 2,
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.secondary.main,
                    px: 4, py: 1.5, fontSize: 20, borderRadius: 2,
                    bgcolor: theme.palette.background.default,
                    '&:hover': { bgcolor: theme.palette.background.paper, borderColor: theme.palette.primary.main }
                  }}
                >
                  Trending
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT: auth tile (hidden when logged in) */}
          {!isLoggedIn && (
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  minWidth: 340,
                  width: '100%',
                  maxWidth: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <ToggleButtonGroup
                  color="primary"
                  value={selectedForm}
                  exclusive
                  onChange={(e, v) => v && setSelectedForm(v)}
                  sx={{ mb: 2 }}
                >
                  <ToggleButton
                    value="login"
                    sx={{
                      width: 120,
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.background.default,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                      '&:hover': { backgroundColor: theme.palette.info.main }
                    }}
                  >
                    Login
                  </ToggleButton>
                  <ToggleButton
                    value="register"
                    sx={{
                      width: 120,
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.background.default,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                      '&:hover': { backgroundColor: theme.palette.info.main }
                    }}
                  >
                    Register
                  </ToggleButton>
                </ToggleButtonGroup>

                {selectedForm === 'login' ? (
                  <Login onLogin={onLogin} />
                ) : (
                  <Register onRegister={onLogin} />
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;
