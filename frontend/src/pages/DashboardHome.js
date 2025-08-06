import React from 'react';
import { Box, Typography, Paper, LinearProgress, Grid, Chip } from '@mui/material';

// Dummy data for demonstration
const currentlyReading = [
    { title: "1984", author: "George Orwell", progress: 65 },
    { title: "The Hobbit", author: "J.R.R. Tolkien", progress: 30 }
];
const booksReadThisYear = 8;
const wantToRead = [
    { title: "Dune", available: true },
    { title: "Sapiens", available: false }
];

export default function DashboardHome({ user }) {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Welcome, {user?.firstName || "Reader"}!
            </Typography>

            {/* Currently Reading Progress */}
            <Paper elevation={2} sx={{ mb: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>📚 Currently Reading</Typography>
                {currentlyReading.length === 0 ? (
                    <Typography>No books currently being read.</Typography>
                ) : (
                    currentlyReading.map((book) => (
                        <Box key={book.title} sx={{ mb: 2 }}>
                            <Typography fontWeight={600}>{book.title}</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>by {book.author}</Typography>
                            <LinearProgress variant="determinate" value={book.progress} sx={{ height: 10, borderRadius: 5 }} />
                            <Typography variant="caption">{book.progress}% complete</Typography>
                        </Box>
                    ))
                )}
            </Paper>

            <Grid container spacing={3}>
                {/* Books Read This Year */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>🎯 Books Read This Year</Typography>
                        <Typography variant="h2" sx={{ color: '#4B3D2D' }}>{booksReadThisYear}</Typography>
                    </Paper>
                </Grid>
                {/* Want to Read Availability */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>📝 Want To Read</Typography>
                        {wantToRead.length === 0 ? (
                            <Typography>No books in your Want To Read list.</Typography>
                        ) : (
                            wantToRead.map((book) => (
                                <Box key={book.title} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
