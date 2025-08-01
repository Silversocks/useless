const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = 3000;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI // should be http://localhost:3000/oauth2callback
);

// Route to start OAuth
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

// Redirect URI callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code provided');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    console.log('✅ Access Token:', tokens.access_token);
    console.log('✅ Refresh Token:', tokens.refresh_token);

    res.send('🎉 Authorization successful! You can close this tab.');
  } catch (err) {
    console.error('❌ Error retrieving access token', err);
    res.status(500).send('Error retrieving tokens');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Start OAuth: http://localhost:${PORT}/auth`);
});
