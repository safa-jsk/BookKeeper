import React from 'react';
import { Typography } from '@mui/material';

export default function AccountSettings({ user }) {
    return (
        <div>
            <Typography variant="h4" sx={{ mb: 2 }}>Welcome, {user?.firstName || "User"}!</Typography>
            <Typography>
                This is your account settings page. Here you can update your profile information, change your password, and manage your preferences.
            </Typography>
        </div>
    );
}
