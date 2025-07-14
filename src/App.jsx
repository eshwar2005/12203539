import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  Box,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import ShortenerPage from './pages/ShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import './App.css';

const logger = (level, message, data = {}) => {
  console.log(`[${level.toUpperCase()}] ${message}`, data);
};

function ShortcodeRedirector({ urlMappings, logger, loading }) {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait until mappings are loaded

    logger('info', `Attempting to resolve shortcode: ${shortcode}`);
    if (shortcode && urlMappings[shortcode]) {
      const originalUrl = urlMappings[shortcode];
      logger('info', `Redirecting shortcode '${shortcode}' to original URL`, { originalUrl });
      window.location.replace(originalUrl);
    } else if (shortcode) {
      logger('warn', `Shortcode '${shortcode}' not found in mappings`, { shortcode });
      navigate('/');
    }
  }, [shortcode, urlMappings, navigate, logger, loading]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="text.secondary">
        {shortcode ? `Looking for ${shortcode}...` : 'Invalid Shortcode.'}
      </Typography>
      {!shortcode && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please go back to the <MuiLink component={Link} to="/">shortener page</MuiLink>.
        </Typography>
      )}
    </Container>
  );
}

function App() {
  const [urlMappings, setUrlMappings] = useState({});
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('urlMappings');
    if (saved) setUrlMappings(JSON.parse(saved));
    setLoading(false);
  }, []);

  // Save to localStorage whenever urlMappings changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
    }
  }, [urlMappings, loading]);

  const addUrlMapping = (shortcode, originalUrl) => {
    setUrlMappings(prevMappings => {
      const newMappings = {
        ...prevMappings,
        [shortcode]: originalUrl,
      };
      logger('info', 'Added new URL mapping', { shortcode, originalUrl, currentMappings: newMappings });
      return newMappings;
    });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Shorten URL
          </Button>
          <Button color="inherit" component={Link} to="/stats">
            Statistics
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ShortenerPage addUrlMapping={addUrlMapping} logger={logger} />} />
          <Route path="/stats" element={<StatisticsPage urlMappings={urlMappings} logger={logger} />} />
          <Route path="/:shortcode" element={<ShortcodeRedirector urlMappings={urlMappings} logger={logger} loading={loading} />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;