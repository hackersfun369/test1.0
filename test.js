const express = require('express');
const YoutubeMusicApi = require('youtube-music-api');
const youtubedl = require('youtube-dl-exec');

const app = express();
const port = 3000;
const API_KEY = 'AIzaSyBqz9tnR4ck6lJ_cunqcPJfoculpSHAY_s';
const api = new YoutubeMusicApi(); // Create instance of YoutubeMusicApi

app.use(express.static('public')); // Serve static files from the public directory
app.use(express.json()); // To parse JSON bodies

// Initialize the API (if required by your version)
api.initalize() // Ensure this matches the correct spelling as per your library's documentation
  .then(() => {
    console.log('API Initialized');

    // Endpoint to search for a song
    app.post('/search', async (req, res) => {
      const songName = req.body.songName;

      try {
        const result = await api.search(songName, 'song');
        console.log('Search Result:', result); // Log the entire result for inspection
        
        if (result.content && result.content.length > 0) {
          const songs = await Promise.all(result.content.map(async (song) => {
            const videoId = song.videoId;
            const videoData = await fetchVideoData(videoId); // Fetch video data to get thumbnail

            return {
              title: song.name,
              artist: Array.isArray(song.artist) ? song.artist.map(a => a.name).join(', ') : song.artist.name,
              videoId: videoId,
              thumbnail: videoData.thumbnail, // Use fetched thumbnail
            };
          }));
          res.json(songs); // Send back the song details as JSON
        } else {
          res.status(404).send('No songs found for the search term.');
        }
      } catch (error) {
        console.error('Error occurred while searching:', error);
        res.status(500).send('An error occurred while searching for the song.');
      }
    });

    // Function to fetch video data from YouTube Data API
    async function fetchVideoData(videoId) {
      const URL = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet&id=${videoId}`;
      try {
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return {
          thumbnail: data.items[0].snippet.thumbnails.medium.url, // Get the thumbnail URL
        };
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return { thumbnail: null }; // Return null if there's an error
      }
    }

    // Endpoint to get audio URL
    app.get('/audio/:videoId', (req, res) => {
      const videoId = req.params.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      youtubedl(videoUrl, {
        getUrl: true,
        extractAudio: true,
        audioFormat: 'mp3',
      })
      .then(audioUrl => {
        res.json({ audioUrl }); // Send back the audio URL as JSON
      })
      .catch(err => {
        console.error('Error fetching audio URL:', err);
        res.status(500).send('Error fetching audio URL.');
      });
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Error initializing API:', error);
  });
