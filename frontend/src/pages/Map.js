import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Box, Typography, Stack, Button, Snackbar, Alert, CircularProgress
} from '@mui/material';

// Load Google Maps JS API script dynamically
function loadGoogleMaps(apiKey, onLoad) {
    const existing = document.getElementById('google-maps-script');
    if (existing) {
        if (window.google && window.google.maps) onLoad();
        else existing.addEventListener('load', onLoad);
        return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = onLoad;
    document.body.appendChild(script);
}

export default function MapPage() {
    const theme = useTheme();
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowRef = useRef(null);
    const userMarkerRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });
    const [position, setPosition] = useState(null);
    const [mapsReady, setMapsReady] = useState(false);
    const [lastResultsCount, setLastResultsCount] = useState(0);

    const center = useMemo(() => position || { lat: 23.8103, lng: 90.4125 }, [position]); // Dhaka fallback

    const clearMarkers = () => {
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
    };

    const initMap = useCallback(() => {
        if (!window.google || !mapRef.current || mapInstanceRef.current) return;
        const google = window.google;

        const initialCenter = { lat: 23.8103, lng: 90.4125 };
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: 6,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
        });

        infoWindowRef.current = new google.maps.InfoWindow();
    }, []);

    const searchNearby = useCallback(() => {
        const google = window.google;
        if (!google || !mapInstanceRef.current) return;

        clearMarkers();
        setLastResultsCount(0);

        const service = new google.maps.places.PlacesService(mapInstanceRef.current);
        let total = 0;

        const handleResults = (results, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
            total += results.length;
            setLastResultsCount(total);

            results.forEach(place => {
                if (!place.geometry || !place.geometry.location) return;
                const marker = new google.maps.Marker({
                    map: mapInstanceRef.current,
                    position: place.geometry.location,
                    title: place.name,
                });
                marker.addListener('click', () => {
                    const address = place.vicinity || place.formatted_address || '';
                    infoWindowRef.current.setContent(`<div><strong>${place.name}</strong><br/>${address}</div>`);
                    infoWindowRef.current.open({ anchor: marker, map: mapInstanceRef.current });
                });
                markersRef.current.push(marker);
            });
        };

        const requestBase = {
            location: position ? new google.maps.LatLng(position.lat, position.lng) : mapInstanceRef.current.getCenter(),
            radius: 50000,
        };

        service.nearbySearch({ ...requestBase, type: 'library' }, handleResults);
        service.nearbySearch({ ...requestBase, type: 'book_store' }, handleResults);
        service.nearbySearch({ ...requestBase, type: 'cafe', keyword: 'book' }, handleResults);

        // If nothing after a short delay, notify
        setTimeout(() => {
            if (total === 0) {
                setSnack({ open: true, severity: 'info', message: 'No nearby libraries/bookstores found in this area.' });
            }
        }, 800);
    }, [position]);

    // Load Google Maps once
    useEffect(() => {
        let cancelled = false;
        if (!apiKey) {
            setSnack({ open: true, severity: 'error', message: 'Missing Google Maps API key (REACT_APP_GOOGLE_MAPS_API_KEY)' });
            setLoading(false);
            return () => { };
        }
        loadGoogleMaps(apiKey, () => { if (!cancelled) setMapsReady(true); });
        return () => { cancelled = true; };
    }, [apiKey]);

    // Get user location once
    useEffect(() => {
        let cancelled = false;
        if (!navigator.geolocation) return () => { };
        navigator.geolocation.getCurrentPosition(
            (pos) => { if (!cancelled) setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
            () => { },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
        );
        return () => { cancelled = true; };
    }, []);

    // Initialize map and run initial search when scripts are ready
    useEffect(() => {
        if (!mapsReady) return;
        try {
            initMap();
            searchNearby();
        } finally {
            setLoading(false);
        }
    }, [mapsReady, initMap, searchNearby]);

    // When position updates, adjust center and user marker without recreating map
    useEffect(() => {
        if (!mapsReady || !mapInstanceRef.current || !window.google || !position) return;
        const google = window.google;
        mapInstanceRef.current.panTo(position);
        mapInstanceRef.current.setZoom(13);
        if (!userMarkerRef.current) {
            userMarkerRef.current = new google.maps.Marker({
                position,
                map: mapInstanceRef.current,
                title: 'You are here',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#1976d2',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#fff',
                },
            });
        } else {
            userMarkerRef.current.setPosition(position);
        }
        searchNearby();
    }, [mapsReady, position, searchNearby]);

    const recenter = () => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(position ? 13 : 6);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            {/* Header: match BookList */}
            <Typography
                variant="h4"
                sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textAlign: 'center',
                    mb: 4
                }}
            >
                Nearby Libraries & Bookstores
            </Typography>

            {/* Results Info: match BookList style */}
            {!loading && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {lastResultsCount > 0
                            ? `Showing ${lastResultsCount} nearby places`
                            : 'No places found near this area'}
                    </Typography>
                </Box>
            )}

            {/* Map box: styled like inputs/cards elsewhere */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 720,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: theme.palette.background.paper,
                    border: `1.5px solid ${theme.palette.info.main}`,
                    boxShadow: 2
                }}
            >
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                {loading && (
                    <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, background: '#fff8' }}>
                        <CircularProgress />
                    </Stack>
                )}
            </Box>

            {/* Actions row: centered like BookList controls */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 2, justifyContent: 'center', alignItems: 'center' }}
            >
                <Button variant="outlined" onClick={recenter}>Re-center</Button>
                <Button variant="contained" onClick={searchNearby}>Refresh Nearby</Button>
            </Stack>

            <Snackbar
                open={snack.open}
                autoHideDuration={3200}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
