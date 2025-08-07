import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function BookCard({ book, onRemove }) {
    const theme = useTheme();
    return (
        <Card
            sx={{
                width: 250,
                height: 390,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                background: theme.palette.background.default,
                boxShadow: '0 4px 16px #0001',
                border: `2px solid ${theme.palette.background.paper}`,
                transition: 'transform 0.22s',
                '&:hover': {
                    boxShadow: '0 8px 24px #0002',
                    transform: 'scale(1.035)',
                    borderColor: theme.palette.primary.main
                }
            }}
        >
            <CardMedia
                component="img"
                height="170"
                image={book.image ? `/${book.image}` : '/default-book-cover.jpg'}
                alt={book.title}
                sx={{
                    objectFit: 'cover',
                    borderRadius: '12px 12px 0 0',
                    background: theme.palette.background.paper
                }}
            />
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography gutterBottom variant="h6" align="center" sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: 17,
                    lineHeight: 1.15,
                    height: 44,
                    overflow: 'hidden'
                }}>
                    {book.title}
                </Typography>
                <Typography variant="body2" color={theme.palette.primary.main} align="center">
                    <strong>Author:</strong> {book.author}
                </Typography>
                <Typography variant="body2" color={theme.palette.primary.main} align="center">
                    <strong>Genre:</strong> {book.genre}
                </Typography>
                <Typography variant="body2" color={theme.palette.primary.main} align="center">
                    <strong>Rating:</strong> {book.rating ? book.rating.toFixed(1) : 'N/A'}
                </Typography>
            </CardContent>
            <Stack direction="column" spacing={1} sx={{ p: 2, pt: 0 }}>
                <Button
                    size="small"
                    component={Link}
                    to={`/books/${book._id}`}
                    color="primary"
                    sx={{
                        borderRadius: 2,
                        background: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 600,
                        letterSpacing: 1,
                        transition: 'background 0.18s',
                        '&:hover': { background: theme.palette.secondary.main }
                    }}
                >
                    View Details
                </Button>
                {onRemove && (
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onRemove(book._id)}
                        sx={{ borderRadius: 2, mt: 1, fontWeight: 600 }}
                    >
                        Remove
                    </Button>
                )}
            </Stack>
        </Card>
    );
}
export default BookCard;