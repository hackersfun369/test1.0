const youtubedl = require('youtube-dl-exec');

const videoUrl = 'https://www.youtube.com/watch?v=jWJQl-9n3XA';

youtubedl(videoUrl, {
    // Use --get-url to fetch the direct audio URL
    getUrl: true,
    extractAudio: true,
    audioFormat: 'mp3',
})
.then(output => {
    console.log('Audio URL:', output);
})
.catch(err => {
    console.error('Error fetching audio URL:', err);
});