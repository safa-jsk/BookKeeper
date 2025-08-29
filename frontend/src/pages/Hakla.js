import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Slider, IconButton, Paper } from '@mui/material';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import { motion } from "framer-motion";

function Hakla() {
    const theme = useTheme();
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(100);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
            audioRef.current.muted = muted;
            audioRef.current.play().catch(() => { });
        }
    }, [volume, muted]);

    return (
        <Box sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(120deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            pb: 6
        }}>
            <Paper
                elevation={8}
                sx={{
                    px: { xs: 2, sm: 6 },
                    py: { xs: 3, sm: 6 },
                    borderRadius: 5,
                    backdropFilter: "blur(6px)",
                    background: "rgba(255,255,255,0.72)",
                    boxShadow: "0 12px 32px 0 rgba(75,61,45,0.16)",
                    maxWidth: 420,
                    textAlign: "center",
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Typography
                    variant="h4"
                    sx={{ color: theme.palette.primary.main, mb: 2, fontWeight: 700, letterSpacing: 1 }}
                    component={motion.div}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 250 }}
                >
                    Trending? Nope... You’ve Been Trolled!
                </Typography>
                <motion.img
                    src="/images/hakla_srk.jpg"
                    alt="Trollface"
                    width={180}
                    style={{ borderRadius: 16, boxShadow: `0 4px 24px 0 ${theme.palette.primary.main}` }}
                    initial={{ scale: 0.9, rotate: -10 }}
                    animate={{ scale: 1.06, rotate: 0 }}
                    transition={{ yoyo: Infinity, duration: 1.4, ease: "easeInOut" }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                />
                <Box mt={4} mb={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton onClick={() => setMuted(!muted)} color="primary">
                        {muted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                    <Slider
                        value={muted ? 0 : volume}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(_, v) => { setVolume(v); if (v === 0) setMuted(true); else setMuted(false); }}
                        sx={{ width: 150, mx: 2 }}
                    />
                </Box>
                <Typography color="text.secondary" fontSize={14}>
                    (Don’t worry—real trending books coming soon!)
                </Typography>
                <audio
                    ref={audioRef}
                    src="/audio/shah-rukh-khan.mp3"
                    autoPlay
                    loop
                    preload="auto"
                />
            </Paper>
        </Box>
    );
}

export default Hakla;
