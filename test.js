const express = require('express');
const YoutubeMusicApi = require('youtube-music-api');
const api = new YoutubeMusicApi();

const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Initialize the API
api.initalize()
  .then(() => console.log('YouTube Music API initialized.'))
  .catch(err => console.error('API initialization failed:', err));

// Search songs endpoint
app.get('/search/songs', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  try {
    const results = await api.search(query, 'song');
    if (!results || !results.content || results.content.length === 0) {
      return res.status(404).json({ error: 'No songs found.' });
    }
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch songs.' });
  }
});

// Search video endpoint
app.get('/search/video', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  try {
    const results = await api.search(query, 'video');
    if (!results || !results.content || results.content.length === 0) {
      return res.status(404).json({ error: 'No videos found.' });
    }
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch videos.' });
  }
});


// Search album endpoint
app.get('/search/album', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  try {
    const results = await api.search(query, 'album');
    if (!results || !results.content || results.content.length === 0) {
      return res.status(404).json({ error: 'No albums found.' });
    }
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch albums.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
