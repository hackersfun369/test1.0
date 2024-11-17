document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return alert('Please enter a search term.');
  
    // Clear previous results
    document.querySelectorAll('.items').forEach(section => (section.innerHTML = ''));
  
    // Fetch general search results
    fetch(`/search?query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        displayResults(data.content, 'songs');
        displayResults(data.content, 'videos');
        displayResults(data.content, 'albums');
        displayResults(data.content, 'artists');
        displayResults(data.content, 'playlists');
      })
      .catch(error => console.error('Error fetching search results:', error));
  });
  
  function displayResults(data, category) {
    const container = document.querySelector(`#${category} .items`);
    data.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('item');
      div.innerHTML = `
        <img src="${item.thumbnails[0]?.url}" alt="${item.name || item.title}">
        <h3>${item.name || item.title}</h3>
        <p>${item.artist?.map(a => a.name).join(', ') || item.author || ''}</p>
        <p>${item.album?.name || item.duration || ''}</p>
      `;
      container.appendChild(div);
    });
  }
  