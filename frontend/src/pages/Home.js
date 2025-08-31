import React, { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
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
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: theme.palette.background.default, py: { xs: 2, md: 8 }, px: 2 }}>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{
          height: { md: 'calc(100vh - 64px)' }, // make grid fill screen (minus navbar)
          maxWidth: 'lg',
          margin: '0 auto',
        }}
      >
        {/* LEFT SIDE (expands to full page width when logged in) */}
        <Grid
          item
          xs={12}
          md={isLoggedIn ? 12 : 6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: { xs: 'auto', md: '100%' }
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Paper elevation={6} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, width: '100%', maxWidth: 540, textAlign: 'center' }}>
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
                    bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, px: 4, py: 1.5, fontSize: 20, borderRadius: 2,
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
                    ml: 2, color: theme.palette.primary.main, borderColor: theme.palette.secondary.main,
                    px: 4, py: 1.5, fontSize: 20, borderRadius: 2,
                    bgcolor: theme.palette.background.default,
                    '&:hover': { bgcolor: theme.palette.background.paper, borderColor: theme.palette.primary.main }
                  }}
                >
                  Trending
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* RIGHT SIDE: hidden when logged in */}
        {!isLoggedIn && (
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: { xs: 'auto', md: '100%' }
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
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
                  onChange={(e, newValue) => {
                    if (newValue) setSelectedForm(newValue);
                  }}
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
                      '&:hover': {
                        backgroundColor: theme.palette.info.main,
                      }
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
                      '&:hover': {
                        backgroundColor: theme.palette.info.main,
                      }
                    }}
                  >
                    Register
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Show Login or Register form below the toggles */}
                {selectedForm === 'login' ? (
                  <Login onLogin={onLogin} />
                ) : (
                  <Register onRegister={onLogin} />
                )}
              </Paper>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Home;
