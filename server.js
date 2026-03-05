const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

// Serve the built React app (optional - if you're serving frontend from here)
// app.use(express.static('dist'));

app.post('/api/messages', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY, // ← pulled from env, never hardcoded
          'anthropic-version': '2023-06-01',           // ← required by Anthropic
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || 'Error calling Anthropic API';
    console.error('Anthropic API error:', message);
    res.status(status).json(message);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
