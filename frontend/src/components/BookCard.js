import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Stack, IconButton, Tooltip, Chip, Box } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { addCartItem } from '../services/api';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export const getConfidenceColor = (confidence) => {
    const score = parseFloat(confidence);
    if (score >= 60) return 'success';
    if (score >= 40) return 'warning';
    return 'default';
};

export default function BookCard({ book, onRemove, onReview, onAddToFinished, onAddedToCart, onWantToRead, height = 420 }) {
    const theme = useTheme();

    // Check if the user is logged in (e.g., by checking for a valid token)
    const isLoggedIn = Boolean(localStorage.getItem('token')); // You can replace this with your auth state logic

    return (
        <Card
            sx={{
                width: 250,
                height: height,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                background: theme.palette.background.default,
                boxShadow: '0 4px 16px #0001',
                border: `2px solid ${theme.palette.background.paper}`,
                transition: 'transform 0.22s',
                position: 'relative',
                '&:hover': {
                    boxShadow: '0 8px 24px #0002',
                    transform: 'scale(1.035)',
                    borderColor: theme.palette.primary.main
                }
            }}
        >
            {/* Show the Cart icon only if logged in */}
            {isLoggedIn && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 70,
                        height: 70,
                        bgcolor: '#fff',
                        clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        p: '4px'
                    }}
                >
                    <Tooltip title="Add to Cart">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={async () => {
                                try {
                                    await addCartItem(book._id, 1);
                                    onAddedToCart && onAddedToCart(book);
                                } catch (_) { }
                            }}
                            sx={{ zIndex: 1, p: '4px' }}
                        >
                            <AddShoppingCartIcon fontSize="medium" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <CardMedia
                component="img"
                height="170"
                image={book.image || '/images/books/harry-potter-and-the-philosophers-stone.jpg'}
                alt={book.title}
                sx={{
                    objectFit: 'cover',
                    borderRadius: '12px 12px 0 0',
                    background: theme.palette.background.paper
                }}
                onError={(e) => {
                    e.target.src = '/images/books/harry-potter-and-the-philosophers-stone.jpg';
                }}
            />

            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography
                    gutterBottom
                    variant="h6"
                    align="center"
                    sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        fontSize: 17,
                        lineHeight: 1.15,
                        height: 44,
                        overflow: 'hidden'
                    }}
                >
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

                {book.confidence && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Tooltip title={`AI Confidence: ${book.confidence}`}>
                            <Chip
                                icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                                label={book.confidence}
                                size="small"
                                color={book.confidenceColor || getConfidenceColor(book.confidence)}
                                variant="filled"
                                sx={{ fontSize: '0.75rem' }}
                            />
                        </Tooltip>
                    </Box>
                )}
            </CardContent>

            <Stack direction="column" spacing={1} sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
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

                {onWantToRead && (
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => onWantToRead(book._id)}
                        sx={{ borderRadius: 2, mt: 1, fontWeight: 600 }}
                    >
                        Add to Want to Read
                    </Button>
                )}

                {onAddToFinished ? (
                    <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => onAddToFinished(book._id)}
                        sx={{ borderRadius: 2, mt: 1, fontWeight: 600 }}
                    >
                        Add to Finished
                    </Button>
                ) : (
                    onReview && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => onReview(book)}
                            sx={{ borderRadius: 2, mt: 1, fontWeight: 600 }}
                        >
                            Review
                        </Button>
                    )
                )}
            </Stack>
        </Card>
    );
}
