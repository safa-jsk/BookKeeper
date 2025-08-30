import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Chip,
    Rating,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    AutoAwesome,
    TrendingUp,
    AddToQueue
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const AIRecommendations = ({ recommendations = [], onAddToWantToRead }) => {
    const theme = useTheme();

    if (!recommendations || recommendations.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <AutoAwesome sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    AI Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Start reading books to get personalized AI recommendations!
                </Typography>
            </Box>
        );
    }

    const getConfidenceColor = (confidence) => {
        const score = parseFloat(confidence);
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'default';
    };

    const handleAddToWantToRead = (bookId) => {
        if (onAddToWantToRead) {
            onAddToWantToRead(bookId);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AutoAwesome sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    AI Recommendations
                </Typography>
                <Chip
                    icon={<TrendingUp />}
                    label="Powered by AI"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 2 }}
                />
            </Box>

            <Grid container spacing={3}>
                {recommendations.map((rec, index) => (
                    <Grid item xs={12} sm={6} md={4} key={rec.bookId}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8],
                                }
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={rec.book?.image || '/images/books/default-book.jpg'}
                                alt={rec.book?.title}
                                sx={{ objectFit: 'cover' }}
                            />

                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="h6" component="h3" sx={{
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {rec.book?.title}
                                    </Typography>
                                    <Tooltip title="Add to Want to Read">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleAddToWantToRead(rec.bookId)}
                                            sx={{ ml: 1 }}
                                        >
                                            <AddToQueue />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    by {rec.book?.author}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Rating
                                        value={rec.book?.rating || 0}
                                        readOnly
                                        size="small"
                                        precision={0.5}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        ({rec.book?.rating || 0})
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                    <Chip
                                        label={rec.book?.genre}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                    />
                                    <Tooltip title={`AI Confidence: ${rec.confidence}`}>
                                        <Chip
                                            icon={<AutoAwesome sx={{ fontSize: 16 }} />}
                                            label={rec.confidence}
                                            size="small"
                                            color={getConfidenceColor(rec.confidence)}
                                            variant="filled"
                                        />
                                    </Tooltip>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    <AutoAwesome sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Recommendations are based on your reading history and AI analysis
                </Typography>
            </Box>
        </Box>
    );
};

export default AIRecommendations;
