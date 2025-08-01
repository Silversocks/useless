const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = 3000;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Set refresh token (from prior authorization)
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

app.get('/', async (req, res) => {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });

    const messages = response.data.messages || [];

    const unreadEmails = await Promise.all(messages.map(async (msg) => {
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      const headers = msgData.data.payload.headers;

      const from = headers.find(h => h.name === 'From')?.value;
      const subject = headers.find(h => h.name === 'Subject')?.value;
      const snippet = msgData.data.snippet;

      return { from, subject, snippet };
    }));

    res.json(unreadEmails);
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    res.status(500).send('Failed to read emails');
  }
});

app.listen(port, () => {
  console.log(`Gmail reader running at http://localhost:${port}`);
});
