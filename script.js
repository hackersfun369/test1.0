document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert('Please enter a search term.');

  // Clear previous results
  document.querySelector('.items').innerHTML = '';

  // Fetch songs
  fetch(`/search/songs?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      displaySongs(data.content); // Call displaySongs with the songs data
    })
    .catch(error => console.error('Error fetching songs:', error));

  // Fetch videos
  fetch(`/search/video?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      displayVideo(data.content); // Call displayVideo with the video data
    })
    .catch(error => console.error('Error fetching videos:', error));

  // Fetch and display artist details and their songs
  fetchAndDisplayArtist(query);
});

// Fetch and display artist details based on search query
// Function to fetch artist details using the provided API URL
function fetchArtistDetails(artistName) {
  const artistSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyBqz9tnR4ck6lJ_cunqcPJfoculpSHAY_s&part=snippet&q=${encodeURIComponent(artistName)}&type=channel&maxResults=1`;

  fetch(artistSearchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        const artist = data.items[0];  // Assuming the first result is the correct artist
        const channelId = artist.id.channelId;
        displayArtistDetails(artist);
        fetchArtistSongs(channelId);  // Pass the channelId to fetch the songs
      } else {
        console.error('Artist not found.');
      }
    })
    .catch(error => console.error('Error fetching artist details:', error));
}

// Function to display artist details (name, description, etc.)
function displayArtistDetails(artist) {
  const container = document.querySelector('#artist .items');
  container.innerHTML = ''; // Clear previous content

  const artistDiv = document.createElement('div');
  artistDiv.classList.add('artist-details');
  artistDiv.innerHTML = `
    <h2>${artist.snippet.title}</h2>
    <p>${artist.snippet.description || 'No description available'}</p>
    <img src="${artist.snippet.thumbnails.high.url}" alt="${artist.snippet.title}">
  `;
  container.appendChild(artistDiv);
}

// Function to fetch songs from the artist's channel using the provided channelId
function fetchArtistSongs(channelId) {
  const songsSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyBqz9tnR4ck6lJ_cunqcPJfoculpSHAY_s&part=snippet&channelId=${channelId}&maxResults=50`;

  fetch(songsSearchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        displayArtistSongs(data.items);  // Call function to display songs
      } else {
        console.log('No songs found for this artist.');
      }
    })
    .catch(error => console.error('Error fetching artist songs:', error));
}

// Function to display artist songs in the 'artist-songs' section
function displayArtistSongs(songs) {
  const container = document.querySelector('#artist-songs .items');
  container.innerHTML = ''; // Clear previous content

  songs.forEach(song => {
    const songDiv = document.createElement('div');
    songDiv.classList.add('song-item');
    if(song.id.videoId){
    songDiv.innerHTML = `
      <h4>${song.snippet.title}</h4>
      <p>Video ID: ${song.id.videoId}</p>
      <img src="${song.snippet.thumbnails.medium.url}" alt="${song.snippet.title}">
      <iframe width="180px" height="180px" src="https://www.youtube.com/embed/${song.id.videoId}?controls=1" title="${song.snippet.title} - YouTube Video" frameborder="0" allow="accelerometer; autoplay; encrypted-media;" allowfullscreen></iframe>
    `;
    container.appendChild(songDiv);
    }
  });
}

// Example usage: Fetch details for artist "Hariharan"
fetchArtistDetails('anurag kulakarni');


// Function to format song duration (e.g., 150000 ms -> 2 minutes 30 seconds)
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

async function displaySongs(songs) {
  const container = document.querySelector('#songs .items');
  container.innerHTML = ''; // Clear previous results if any

  for (const song of songs) {
    const div = document.createElement('div');
    div.classList.add('item');

    // Fetch the thumbnail asynchronously
    const videoData = await fetchVideoData(song.videoId);

    div.innerHTML = `
      <p>Video ID: ${song.videoId}</p>
      <iframe 
          width="180px"
          height="180px"
          src="https://www.youtube.com/embed/${song.videoId}?controls=1" 
          title="${song.title} - YouTube Video" 
          frameborder="0" 
          allow="accelerometer; autoplay; encrypted-media;" 
          allowfullscreen>
      </iframe>
      <img src="${videoData.thumbnail || song.thumbnails[1]?.url}" alt="${song.name}">
      <h3>${song.name}</h3>
      <p>Artist: ${song.album?.name || 'N/A'}</p>
      <p>Duration: ${formatDuration(song.duration)}</p>
    `;
    container.appendChild(div);
  }
}

async function fetchVideoData(videoId) {
  const API_KEY = 'AIzaSyBqz9tnR4ck6lJ_cunqcPJfoculpSHAY_s';
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

function displayVideo(songs) {
  const container = document.querySelector('#video .items');
  songs.forEach(song => {
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = `
      <p>${song.videoId}</p>
      <iframe 
          src="https://www.youtube.com/embed/${song.videoId}?controls=1" 
          title="${song.title} - YouTube Video" 
          frameborder="0" 
          allow="accelerometer; autoplay; encrypted-media;" 
          allowfullscreen>
      </iframe>
      <h3>${song.name}</h3>
      <p>Duration: ${formatDuration(song.duration)}</p>
    `;
    container.appendChild(div);
  });
}
