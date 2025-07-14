import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  Box,
  InputAdornment,
  Container,
  Alert,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { AccessTime, Link as LinkIcon, Key as KeyIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

// Removed logger definition from here - it's now passed as a prop from App.jsx

// ShortenerPage component now accepts props: addUrlMapping and logger
function ShortenerPage({ addUrlMapping, logger }) {
  // State for form inputs
  const [longUrl, setLongUrl] = useState('');
  const [useCustomValidity, setUseCustomValidity] = useState(false);
  const [validityPeriod, setValidityPeriod] = useState(30);
  const [useCustomShortcode, setUseCustomShortcode] = useState(false);
  const [customShortcode, setCustomShortcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortenedUrlData, setShortenedUrlData] = useState(null);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setShortenedUrlData(null);
    setLoading(true);

    logger('info', 'Attempting to shorten URL');

    // --- Client-Side Validation ---
    if (!longUrl) {
      setError('Original Long URL is required.');
      setLoading(false);
      logger('warn', 'Validation failed: Long URL is empty');
      return;
    }
    try {
        new URL(longUrl);
    } catch (e) {
        setError('Please enter a valid URL (e.g., https://example.com).');
        setLoading(false);
        logger('warn', 'Validation failed: Invalid URL format', { url: longUrl });
        return;
    }

    if (useCustomValidity) {
      if (validityPeriod === '' || isNaN(validityPeriod) || Number(validityPeriod) <= 0) {
        setError('Validity Period must be a positive number of minutes.');
        setLoading(false);
        logger('warn', 'Validation failed: Invalid validity period', { period: validityPeriod });
        return;
      }
    }

    if (useCustomShortcode) {
      if (!customShortcode) {
        setError('Custom Shortcode cannot be empty if enabled.');
        setLoading(false);
        logger('warn', 'Validation failed: Custom shortcode is empty');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(customShortcode)) {
        setError('Custom Shortcode can only contain letters, numbers, hyphens, and underscores.');
        setLoading(false);
        logger('warn', 'Validation failed: Invalid custom shortcode format', { shortcode: customShortcode });
        return;
      }
    }
    // --- End Client-Side Validation ---

    logger('info', 'Client-side validation passed', { longUrl, useCustomValidity, validityPeriod, useCustomShortcode, customShortcode });

    // Simulate API call to backend
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const simulatedShortcode = useCustomShortcode ? customShortcode : Math.random().toString(36).substring(2, 8);
      // IMPORTANT: The short URL needs to match the dynamic route format for the redirector to catch it.
      // Using window.location.origin to ensure it works whether on localhost:5173 or deployed
      const simulatedShortUrl = `${window.location.origin}/${simulatedShortcode}`;
      const simulatedExpiryDate = useCustomValidity
        ? new Date(Date.now() + validityPeriod * 60 * 1000).toLocaleString()
        : 'Never';

      // Call the function passed from App.jsx to add the mapping
      addUrlMapping(simulatedShortcode, longUrl);

      setShortenedUrlData({
        originalUrl: longUrl,
        shortUrl: simulatedShortUrl,
        shortcode: simulatedShortcode,
        expiryDate: simulatedExpiryDate,
      });
      logger('success', 'URL shortened successfully (simulated)', { shortUrl: simulatedShortUrl });
      setError('');

    } catch (err) {
      console.error('Simulated API Error:', err);
      setError('Failed to shorten URL. Please try again later.');
      logger('error', 'Simulated API call failed', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyClick = () => {
    if (shortenedUrlData?.shortUrl) {
      navigator.clipboard.writeText(shortenedUrlData.shortUrl)
        .then(() => {
          console.log('Short URL copied to clipboard!');
          logger('info', 'Short URL copied to clipboard', { shortUrl: shortenedUrlData.shortUrl });
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
          logger('error', 'Failed to copy short URL', { error: err.message });
        });
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Shorten Your URL
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Original Long URL"
                variant="outlined"
                fullWidth
                required
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                error={!!error && !longUrl}
                helperText={!!error && !longUrl ? error : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useCustomValidity}
                    onChange={(e) => setUseCustomValidity(e.target.checked)}
                    name="customValidity"
                    color="primary"
                  />
                }
                label="Set Custom Validity Period"
              />
            </Grid>

            {useCustomValidity && (
              <Grid item xs={12}>
                <TextField
                  label="Validity Period (minutes)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  error={!!error && useCustomValidity && (validityPeriod === '' || isNaN(validityPeriod) || Number(validityPeriod) <= 0)}
                  helperText={!!error && useCustomValidity && (validityPeriod === '' || isNaN(validityPeriod) || Number(validityPeriod) <= 0) ? error : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useCustomShortcode}
                    onChange={(e) => setUseCustomShortcode(e.target.checked)}
                    name="customShortcode"
                    color="primary"
                  />
                }
                label="Use Custom Shortcode"
              />
            </Grid>

            {useCustomShortcode && (
              <Grid item xs={12}>
                <TextField
                  label="Preferred Custom Shortcode"
                  variant="outlined"
                  fullWidth
                  value={customShortcode}
                  onChange={(e) => setCustomShortcode(e.target.value)}
                  error={!!error && useCustomShortcode && (!customShortcode || !/^[a-zA-Z0-9_-]+$/.test(customShortcode))}
                  helperText={!!error && useCustomShortcode && (!customShortcode || !/^[a-zA-Z0-9_-]+$/.test(customShortcode)) ? error : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Shorten URL'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {shortenedUrlData && (
          <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Your Shortened URL:
            </Typography>
            <MuiLink
              href={shortenedUrlData.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="h5"
              sx={{ wordBreak: 'break-all' }}
            >
              {shortenedUrlData.shortUrl}
            </MuiLink>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Original URL: {shortenedUrlData.originalUrl}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expires: {shortenedUrlData.expiryDate}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              sx={{ mt: 2 }}
              onClick={handleCopyClick}
            >
              Copy Short URL
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ShortenerPage;