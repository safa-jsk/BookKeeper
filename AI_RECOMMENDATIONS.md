# AI Recommendation System

## Overview

The BookKeeper application now includes an AI-powered recommendation system that suggests books to users based on their reading history. The system analyzes the books a user has finished and provides personalized recommendations using machine learning algorithms.

## Features

- **Personalized Recommendations**: Based on user's finished books
- **AI Confidence Scores**: Each recommendation includes a confidence percentage
- **Real-time Updates**: Recommendations update as users finish more books
- **Interactive UI**: Users can add recommended books to their "Want to Read" list
- **Modern Design**: Beautiful card-based interface with hover effects

## Technical Implementation

### Backend Components

1. **Recommendation Service** (`backend/src/services/recommendationService.js`)

   - Loads AI models from `rec_index.json`
   - Processes user's finished books to generate recommendations
   - Calculates similarity scores and confidence levels

2. **Dashboard Controller** (`backend/src/controllers/dashboard.controller.js`)
   - Integrates recommendations into the dashboard API
   - Fetches book details for recommended books
   - Returns recommendations with full book information

### Frontend Components

1. **AI Recommendations Component** (`frontend/src/components/AIRecommendations.js`)

   - Displays recommendations in an attractive card layout
   - Shows book covers, titles, authors, ratings, and genres
   - Includes AI confidence indicators
   - Provides "Add to Want to Read" functionality

2. **Dashboard Integration** (`frontend/src/pages/dashboard/Home.js`)
   - Integrates AI recommendations into the user dashboard
   - Handles adding books to want-to-read list
   - Refreshes data after user actions

## AI Model Data

The system uses the following data files:

- `rec_index.json`: Contains similarity scores between books
- `booksAI.pkl`: Book embeddings (for future enhancements)
- `similarity.pkl`: Similarity matrix (for future enhancements)

## How It Works

1. **Data Loading**: The recommendation service loads the AI models on startup
2. **User Analysis**: When a user visits their dashboard, the system analyzes their finished books
3. **Similarity Calculation**: For each finished book, the system finds similar books using pre-computed similarity scores
4. **Score Aggregation**: Similarity scores are aggregated across all finished books
5. **Ranking**: Books are ranked by their total similarity score
6. **Filtering**: Books already finished by the user are excluded
7. **Presentation**: Top recommendations are displayed with confidence scores

## API Endpoints

### GET /api/dashboard

Returns dashboard data including AI recommendations:

```json
{
  "recommendations": [
    {
      "bookId": "book_id",
      "score": 0.85,
      "confidence": "85.0%",
      "book": {
        "title": "Book Title",
        "author": "Author Name",
        "genre": "Fiction",
        "rating": 4.5,
        "image": "book_cover_url"
      }
    }
  ]
}
```

## Future Enhancements

1. **Enhanced AI Models**: Integrate the pickle files for more sophisticated recommendations
2. **Collaborative Filtering**: Add user-to-user similarity for collaborative recommendations
3. **Content-Based Filtering**: Analyze book content and user preferences
4. **Real-time Learning**: Update recommendations based on user interactions
5. **Genre Preferences**: Weight recommendations based on user's preferred genres
6. **Reading Speed**: Consider reading pace in recommendations
7. **Seasonal Recommendations**: Suggest books based on time of year or current events

## Configuration

The recommendation system can be configured by:

- Adjusting the number of recommendations returned (default: 6)
- Modifying confidence score thresholds
- Adding genre-based filtering
- Implementing user preference weights

## Troubleshooting

If recommendations are not appearing:

1. Check that `rec_index.json` exists in the backend directory
2. Verify the file format is correct JSON
3. Ensure user has finished books in their profile
4. Check server logs for any loading errors

## Performance Considerations

- The recommendation service loads models on startup to avoid repeated file I/O
- Recommendations are calculated on-demand for each user
- Consider caching recommendations for frequently accessed users
- Monitor memory usage with large recommendation datasets
