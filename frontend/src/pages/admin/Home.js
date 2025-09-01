import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { admin } from '../../services/api';
import {
    People as PeopleIcon,
    PendingActions as PendingIcon
} from '@mui/icons-material';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';         // Libraries
import AutoStoriesIcon from '@mui/icons-material/AutoStories';           // Books

export default function AdminHome() {
    const theme = useTheme();
    const [stats, setStats] = useState({
        users: 0,
        libraries: 0,
        books: 0,
        pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                const [usersRes, librariesRes, booksRes, requestsRes] = await Promise.all([
                    admin.listUsers(),
                    admin.listLibraries(),
                    admin.listBooks(),
                    admin.listRequests('pending')
                ]);

                setStats({
                    users: usersRes.data?.length || 0,
                    libraries: librariesRes.data?.length || 0,
                    books: booksRes.data?.length || 0,
                    pendingRequests: requestsRes.data?.length || 0
                });
            } catch (err) {
                console.error('Error fetching admin stats:', err);
                setError('Failed to load statistics. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${color}30`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${color}20`
                }
            }}
        >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: `${color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }} />
                    </Box>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: color, mb: 1 }}>
                    {value.toLocaleString()}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 3,
                minHeight: 'calc(100vh - 64px)', // account for top navbar
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        letterSpacing: 1,
                        mb: 1
                    }}
                >
                    Admin Dashboard
                </Typography>

                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ maxWidth: 700, mx: 'auto' }}
                >
                    Welcome to the BookKeeper Admin Panel. Here's an overview of your system statistics.
                </Typography>
            </Box>

            {/* Centered tiles */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',     // vertical center
                    justifyContent: 'center'  // horizontal center
                }}
            >
                <Grid
                    container
                    spacing={3}
                    sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}
                    justifyContent="center"
                    alignItems="stretch"
                >
                    <Grid item xs={12} sm={6} md={3} minWidth={200} alignItems="center">
                        <StatCard
                            title="Total Users"
                            value={stats.users}
                            icon={PeopleIcon}
                            color={theme.palette.primary.main}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} minWidth={200} alignItems="center">
                        <StatCard
                            title="Libraries"
                            value={stats.libraries}
                            icon={LocalLibraryIcon}
                            color={theme.palette.secondary.main}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} minWidth={200} alignItems="center">
                        <StatCard
                            title="Books"
                            value={stats.books}
                            icon={AutoStoriesIcon}
                            color={theme.palette.success.main}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} minWidth={200} alignItems="center">
                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            icon={PendingIcon}
                            color={theme.palette.warning.main}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Footer hint */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Use the navigation menu on the left to manage different aspects of the system.
                </Typography>
            </Box>
        </Box>
    );
}
