import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardHeader, CardContent, Stack, TextField, Typography, Chip, Grid, Alert } from '@mui/material';
import BookCard from '../components/BookCard';
import { books as booksApi } from '../services/api';

const GENRE_SYNONYMS = {
    'sci-fi': ['sci-fi', 'science fiction', 'scifi', 'space'],
    'fantasy': ['fantasy', 'magic', 'dragon', 'elves'],
    'mystery': ['mystery', 'detective', 'whodunit', 'crime'],
    'romance': ['romance', 'love', 'romcom'],
    'thriller': ['thriller', 'suspense'],
    'horror': ['horror', 'scary', 'ghost', 'vampire', 'monster'],
    'classic': ['classic', 'literature', 'canonical'],
    'historical': ['historical', 'history'],
    'young adult': ['young adult', 'ya', 'teen'],
    'children': ['children', 'kids'],
};

function parseQuery(q) {
    const text = (q || '').toLowerCase();
    const constraints = {
        author: null,
        minRating: null,
        yearAfter: null,
        yearBefore: null,
        genres: new Set(),
    };

    // author: "by <name>"
    const byMatch = text.match(/\bby\s+([a-z\s.-]+)/i);
    if (byMatch) constraints.author = byMatch[1].trim();

    // rating: "rated (above|over|>=) N" or "rating >= N" or "rating above N"
    const ratingMatch = text.match(/(rated|rating)\s*(?:above|over|>=)?\s*(\d(?:\.\d)?)/);
    if (ratingMatch) constraints.minRating = parseFloat(ratingMatch[2]);

    // year constraints: after/before
    const afterMatch = text.match(/after\s*(\d{3,4})/);
    if (afterMatch) constraints.yearAfter = parseInt(afterMatch[1], 10);
    const beforeMatch = text.match(/before\s*(\d{3,4})/);
    if (beforeMatch) constraints.yearBefore = parseInt(beforeMatch[1], 10);

    // genres via synonyms
    for (const [genre, keys] of Object.entries(GENRE_SYNONYMS)) {
        if (keys.some(k => text.includes(k))) constraints.genres.add(genre);
    }

    return constraints;
}

function scoreBook(book, q, constraints) {
    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();
    const genre = (book.genre || '').toLowerCase();
    let score = 0;

    const needle = (q || '').toLowerCase().trim();
    let titleMatch = false, authorMatch = false, genreMatch = false;
    if (needle) {
        if (title.includes(needle)) { score += 6; titleMatch = true; }
        if (author.includes(needle)) { score += 6; authorMatch = true; }
        if (genre.includes(needle)) { score += 5; genreMatch = true; }
    }

    // author constraint
    let authorConstraintMatched = false;
    if (constraints.author) {
        if (author.includes(constraints.author.toLowerCase())) { score += 8; authorConstraintMatched = true; } else score -= 4;
    }

    // rating constraint
    if (typeof constraints.minRating === 'number') {
        if ((book.rating || 0) >= constraints.minRating) score += 5; else score -= 5;
    }

    // year constraints
    if (constraints.yearAfter && book.year) {
        if (book.year > constraints.yearAfter) score += 2; else score -= 2;
    }
    if (constraints.yearBefore && book.year) {
        if (book.year < constraints.yearBefore) score += 2; else score -= 2;
    }

    // genre synonyms
    let genreConstraintMatched = false;
    if (constraints.genres.size > 0) {
        for (const g of constraints.genres) {
            if (genre.includes(g)) { score += 7; genreConstraintMatched = true; break; }
        }
    }

    // small boost by popularity
    const popularity = (book.favoritedBy?.length || 0) * 3 + (book.finishedBy?.length || 0) * 2 + (book.wantToReadBy?.length || 0) + (book.currentlyReadingBy?.length || 0);
    score += Math.min(6, Math.floor(popularity / 5));

    // If user typed something, require at least one meaningful match; otherwise filter out
    const anyConstraintSpecified = !!(constraints.author || typeof constraints.minRating === 'number' || constraints.yearAfter || constraints.yearBefore || constraints.genres.size > 0);
    const anyTextMatch = titleMatch || authorMatch || genreMatch;
    const anyConstraintMatch = authorConstraintMatched || genreConstraintMatched;
    if (needle && !(anyTextMatch || anyConstraintMatch || anyConstraintSpecified)) {
        score = -9999;
    }

    return score;
}

export default function AISearch() {
    const [q, setQ] = useState('');
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await booksApi.list();
                setList(Array.isArray(data) ? data : []);
            } finally { setLoading(false); }
        };
        load();
    }, []);

    const constraints = useMemo(() => parseQuery(q), [q]);

    const results = useMemo(() => {
        const needle = (q || '').trim();
        if (!list.length || needle.length === 0) return [];
        const scored = list.map(b => ({ ...b, _score: scoreBook(b, q, constraints) }));
        const filtered = scored.filter(b => b._score > 0);
        filtered.sort((a, b) => b._score - a._score);
        return filtered.slice(0, 40);
    }, [list, q, constraints]);

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="AI Book Search" subheader="Search by intent, author, genre, rating, year" />
                <CardContent>
                    <Stack spacing={2}>
                        <TextField
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="e.g., cozy fantasy after 2000 by sanderson rated above 4"
                            fullWidth
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                            {constraints.author && <Chip label={`Author: ${constraints.author}`} />}
                            {typeof constraints.minRating === 'number' && <Chip label={`Rating ≥ ${constraints.minRating}`} />}
                            {constraints.yearAfter && <Chip label={`After ${constraints.yearAfter}`} />}
                            {constraints.yearBefore && <Chip label={`Before ${constraints.yearBefore}`} />}
                            {[...constraints.genres].map(g => (<Chip key={g} label={`Genre: ${g}`} />))}
                        </Stack>

                        {loading ? (
                            <Typography color="text.secondary">Loading…</Typography>
                        ) : results.length === 0 ? (
                            <Alert severity="info">No matches yet. Try adding an author, genre, or rating.</Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {results.map(b => (
                                    <Grid item key={b._id} xs={12} sm={6} md={4} lg={3}>
                                        <BookCard book={b} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}


