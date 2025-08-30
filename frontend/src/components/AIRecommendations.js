import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import { AutoAwesome, TrendingUp } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import BookCard, { getConfidenceColor } from './BookCard';

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

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AutoAwesome sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    AI Recommendations
                </Typography>
                <Chip
                    icon={<TrendingUp />}
                    label="Powered by SI"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 2 }}
                />
            </Box>

            <Grid container spacing={3}>
                {recommendations.slice(0, 5).map((rec) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={rec.dbId}>
                        <BookCard
                            book={{
                                ...rec.book,
                                confidence: rec.confidence,
                                confidenceColor: getConfidenceColor(rec.confidence)
                            }}
                            onWantToRead={onAddToWantToRead}
                        />
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
