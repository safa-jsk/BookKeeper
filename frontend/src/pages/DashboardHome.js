import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, LinearProgress, Grid, Chip } from '@mui/material';

export default function DashboardHome({ user }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setData(res.data);
        });
    }, []);

    if (!data) return <Typography>Loading dashboard...</Typography>;

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Welcome, {user?.firstName || "Reader"}!
            </Typography>

            {/* Currently Reading Progress */}
            <Paper elevation={2} sx={{ mb: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>📚 Currently Reading</Typography>
                {data.currentlyReading.length === 0 ? (
                    <Typography>No books currently being read.</Typography>
                ) : (
                    data.currentlyReading.map((book) => (
                        <Box key={book._id} sx={{ mb: 2 }}>
                            <Typography fontWeight={600}>{book.title}</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>by {book.author}</Typography>
                            <LinearProgress variant="determinate" value={book.progress || 0} sx={{ height: 10, borderRadius: 5 }} />
                            <Typography variant="caption">{book.progress || 0}% complete</Typography>
                        </Box>
                    ))
                )}
            </Paper>

            <Grid container spacing={3}>
                {/* Books Read This Year */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>🎯 Books Read This Year</Typography>
                        <Typography variant="h2" sx={{ color: '#4B3D2D' }}>{data.booksReadThisYear}</Typography>
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
            </Grid>
        </Box>
    );
}
