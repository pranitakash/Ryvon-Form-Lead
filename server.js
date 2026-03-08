const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static directory for front-end
app.use(express.static(__dirname));

// Redirect root to Page 1
app.get('/', (req, res) => {
  res.redirect('/Page%201/index.html');
});

// --- Google Sheets Sync Only ---

/**
 * POST /api/leads
 * Receives form data and forwards it to Google Sheets
 */
app.post('/api/leads', async (req, res) => {
  try {
    const data = req.body;

    // Send data to Google Sheet via Apps Script
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL; // Add your Web App URL here or in .env

    if (scriptUrl) {
      // Send a POST request to the Google Apps Script Web App
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Non-JSON response from Google Apps Script. Ensure the script is deployed with access to "Anyone". Response:', responseText);
        return res.status(500).json({ success: false, message: 'Google Sheets integration error. Invalid response.' });
      }

      if (result.status === 'success') {
        console.log(`Lead from ${data.firstName} ${data.lastName} successfully synced to Google Sheets!`);
        res.json({ success: true, message: 'Lead saved successfully' });
      } else {
        console.error('Failed to sync to Google Sheets:', result);
        res.status(500).json({ success: false, message: 'Failed to sync to Google Sheets' });
      }
    } else {
      console.error('GOOGLE_SCRIPT_URL is not set.');
      res.status(500).json({ success: false, message: 'Server configuration error: Google Script URL is missing.' });
    }

  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ success: false, message: 'Failed to save lead' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`\n  Ryvon Lead Server running at http://localhost:${PORT}\n`);
});
