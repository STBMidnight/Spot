const CLIENT_ID = 'b81c711233ea407cbb20c36f1f69d64a';
const REDIRECT_URI = 'https://stbmidnight.github.io/Spot/'; // Must be HTTPS!
const SCOPES = 'playlist-modify-public user-top-read';

const loginBtn = document.getElementById('login-btn');
const generateBtn = document.getElementById('generate-btn');

let accessToken = null;

function getAccessToken() {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    if (accessToken) {
      loginBtn.disabled = true;
      generateBtn.disabled = false;
    }
  }
}

loginBtn.onclick = () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
  window.location = authUrl;
};

generateBtn.onclick = async () => {
  const headers = { Authorization: 'Bearer ' + accessToken };

  const user = await fetch('https://api.spotify.com/v1/me', { headers }).then(res => res.json());
  const userId = user.id;

  const topTracks = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', { headers }).then(res => res.json());
  const seedTrackIds = topTracks.items.map(track => track.id);

  const recsUrl = `https://api.spotify.com/v1/recommendations?limit=20&seed_tracks=${seedTrackIds.join(',')}`;
  const recs = await fetch(recsUrl, { headers }).then(res => res.json());
  const recTrackUris = recs.tracks.map(t => t.uri);

  const playlist = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Midnight Mix',
      description: 'Custom AI-like playlist made with top tracks & discoveries',
      public: true
    })
  }).then(res => res.json());

  await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uris: recTrackUris })
  });

  alert('🎉 Playlist created successfully!');
};

getAccessToken();
