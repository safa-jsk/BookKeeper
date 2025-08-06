import React from 'react';
import { Typography } from '@mui/material';

export default function CurrentlyReading({ user }) {
    return (
        <div>
            <Typography variant="h4" sx={{ mb: 2 }}>Welcome, {user?.firstName || "User"}!</Typography>
            <Typography>
                This is your currently reading page. Here you can see the books you are currently reading.
            </Typography>
        </div>
    );
}
