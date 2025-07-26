const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/login', (req, res) => {
  const scope = 'playlist-modify-public user-top-read';
  const authURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
  res.redirect(authURL);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    }
  });

  const { access_token } = response.data;
  res.redirect(`https://stbmidnight.github.io/Spot/#access_token=${access_token}`);
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
