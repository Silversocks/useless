const { google } = require('googleapis');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

const readGmailMiddleware = async (req, res, next) => {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 5, // change as needed
    });

    const messages = response.data.messages || [];

    const emailData = await Promise.all(messages.map(async (msg) => {
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      const headers = msgData.data.payload.headers;

      return {
        from: headers.find(h => h.name === 'From')?.value,
        subject: headers.find(h => h.name === 'Subject')?.value,
        snippet: msgData.data.snippet,
      };
    }));

    // Extract 'from' addresses into a list
    const fromList = emailData.map(email => email.from).filter(Boolean);

    // Append to req.body
    req.body = req.body || {};
    req.body.fromAddresses = fromList;

    next();
  } catch (err) {
    console.error('Failed to read Gmail:', err);
    res.status(500).json({ error: 'Failed to read Gmail' });
  }
};

module.exports = readGmailMiddleware;
