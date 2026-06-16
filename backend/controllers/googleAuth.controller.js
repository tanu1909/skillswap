import { google } from 'googleapis';
import User from '../models/User.model.js';



const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
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

    const oauth2Client = getOAuthClient();
    
    // Exchange the temporary auth code for permanent secure tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Update the corresponding user in MongoDB with the tokens
    await User.findByIdAndUpdate(state, {
      googleTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token, // Saved safely for long-term API access
        expiryDate: tokens.expiry_date
      }
    });

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