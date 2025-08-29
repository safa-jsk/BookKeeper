import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Box, Typography, Paper, Grid, Chip, Stack } from '@mui/material';
import { listMyRequests } from '../../services/api';

function DashboardHome({ user }) {
    const theme = useTheme();
    const [data, setData] = useState(null);
    const [myRequests, setMyRequests] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setData(res.data);
        });
        listMyRequests().then(res => setMyRequests(res.data || []));
    }, []);

    if (!data) return <Typography>Loading dashboard...</Typography>;

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Welcome, {user?.firstName || "Reader"}!
            </Typography>

            <Grid container spacing={3}>
                {/* Books Read This Year */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>🎯 Books Read This Year</Typography>
                        <Typography variant="h2" sx={{ color: theme.palette.primary.main }}>{data.booksReadThisYear}</Typography>
                    </Paper>
                </Grid>
                {/* Want to Read Availability */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>📝 Want To Read</Typography>
                        {data.wantToRead.length === 0 ? (
                            <Typography>No books in your Want To Read list.</Typography>
                        ) : (
                            data.wantToRead.map((book) => (
                                <Box key={book._id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ flex: 1 }}>{book.title}</Typography>
                                    <Chip
                                        label={book.available ? "Available" : "Not Available"}
                                        color={book.available ? "success" : "default"}
                                        size="small"
                                    />
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>

                {/* My Requests Status */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>📦 Book Requests</Typography>
                        {myRequests.length === 0 ? (
                            <Typography color="text.secondary">No requests yet.</Typography>
                        ) : (
                            <Stack spacing={1}>
                                {myRequests.map(r => (
                                    <Box key={r._id} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ flex: 1 }}>
                                            {r.items.map(it => `${it.book?.title} (x${it.quantity})`).join(', ')} — {r.library?.name}
                                        </Typography>
                                        <Chip
                                            label={r.status === 'delayed' && r.expectedAt ? `Delayed until ${new Date(r.expectedAt).toLocaleDateString()}` : r.status}
                                            color={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : r.status === 'delayed' ? 'warning' : 'default'}
                                            size="small"
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default DashboardHome;