// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { simulateLoad } = require('./load');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '20mb' }));

// Utility to enforce safe input bounds
function safe(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Load simulation endpoint
app.post('/simulate-load', (req, res) => {
  const cpu = safe(req.body.cpu || 1, 0, 8);
  const ram = safe(req.body.ram || 100, 0, 8192); // Max 8GB RAM
  const duration = safe(req.body.duration || 10, 1, 300); // Max 5 minutes

  console.log(`[API] /simulate-load invoked with cpu=${cpu}, ram=${ram}, duration=${duration}`);

  // Send response immediately to avoid blocking on load start
  res.json({ status: 'started', cpu, ram, duration });

  try {
    simulateLoad({ cpu, ram, duration });
  } catch (error) {
    console.error(`[ERROR] simulateLoad threw: ${error.message}`, error);
  }
});

const rawBody = require('raw-body');

app.post('/accept-payload', async (req, res) => {
  try {
    await rawBody(req, { length: req.headers['content-length'], limit: '20mb' });
    res.status(200).json({ status: 'received' });
  } catch (err) {
    console.error('Payload error:', err.message);
    res.status(413).send('Payload too large or invalid');
  }
});



// Start server with timeout protections
const server = app.listen(port, () => {
  console.log(`[API] Load API running on port ${port}`);
});

// Prevent long-lived HTTP connections from stalling
server.setTimeout(10000); // 10 seconds
