const express = require('express');
const YoutubeMusicApi = require('youtube-music-api');
const youtubedl = require('youtube-dl-exec');

const app = express();
const port = 3000;
const api = new YoutubeMusicApi();

app.use(express.static('public')); // Serve static files from the public directory
app.use(express.json()); // To parse JSON bodies

api.initalize() // Ensure this is spelled correctly
  .then(() => {
    console.log('API Initialized');

    // Endpoint to search for a song
    app.post('/search', (req, res) => {
      const songName = req.body.songName;

      api.search(songName, 'song')
        .then(result => {
          console.log('Search Result:', result); // Log the entire result for inspection
          
          if (result.content && result.content.length > 0) {
            const songs = result.content.map(song => ({
              title: song.name,
              // Check if artist is an array or a single object
              artist: Array.isArray(song.artist) ? song.artist.map(a => a.name).join(', ') : song.artist.name,
              videoId: song.videoId,
              thumbnail: song.thumbnails[0].url,
            }));
            res.json(songs); // Send back the song details as JSON
          } else {
            res.status(404).send('No songs found for the search term.');
          }
        })
        .catch(error => {
          console.error('Error occurred while searching:', error);
          res.status(500).send('An error occurred while searching for the song.');
        });
    });

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