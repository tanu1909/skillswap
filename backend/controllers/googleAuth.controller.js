import { google } from 'googleapis';
import User from '../models/User.model.js';


const getGoogleRedirectUri = () => {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/auth/google/callback`;
  }
  return undefined;
};

const validateGoogleConfig = () => {
  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    .filter((key) => !process.env[key]);

  if (!getGoogleRedirectUri()) missing.push('GOOGLE_REDIRECT_URI or BACKEND_URL');
  if (missing.length) {
    throw new Error(`Missing Google Calendar configuration: ${missing.join(', ')}`);
  }
};


const getOAuthClient = () => {
  validateGoogleConfig();

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri()
  );
};

// Generate Google URL and redirect user to consent screen
// GET /api/auth/google/connect
export const connectGoogleCalendar = (req, res) => {
  try {
    const oauth2Client = getOAuthClient();
    
    // Scopes required to manage calendar events on the user's behalf
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    // access_type: 'offline' and prompt: 'consent' are CRITICAL to receive a permanent Refresh Token
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: req.user._id.toString() // Pass user ID through state to map tokens on callback
    });

    res.json({ url });
  } catch (err) {
    console.error('Google Calendar connection error:', err.message);
    res.status(500).json({ message: 'Failed to generate Google OAuth URL', error: err.message });
  }
};

// OAuth Callback endpoint to catch authorization code and store tokens
// GET /api/auth/google/callback
export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query; // 'state' contains the user ID passed above
    if (!code) return res.status(400).send('Authorization code missing.');
    if (!state) return res.status(400).send('User state missing.');

    const oauth2Client = getOAuthClient();
    
    // Exchange the temporary auth code for permanent secure tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Update the corresponding user in MongoDB with the tokens
    const updateData = {
      'googleTokens.accessToken': tokens.access_token,
      'googleTokens.expiryDate': tokens.expiry_date
    };
    if (tokens.refresh_token) {
      updateData['googleTokens.refreshToken'] = tokens.refresh_token;
    }
    const updatedUser = await User.findByIdAndUpdate(state, { $set: updateData });
    if (!updatedUser) return res.status(404).send('User not found.');

    // Send a clean script message to close the OAuth window and refresh the dashboard profile
    res.send(`
      <script>
        window.opener.postMessage('google-calendar-connected', '*');
        window.close();
      </script>
    `);
  } catch (error) {
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
};
