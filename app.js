// server.js

const express = require('express');
const bodyParser = require('body-parser');
const rawBody = require('raw-body');
const { simulateLoad } = require('./load');

const app = express();
const port = process.env.PORT || 3000;

// Endpoint that accepts large raw POSTs and responds fast
app.post('/accept-payload', async (req, res) => {
  try {
    await rawBody(req, {
      length: req.headers['content-length'],
      limit: '20mb'  // Cap at 20MB
    });

    res.json({ status: 'received' });
  } catch (err) {
    console.error('Payload error:', err.message);
    res.status(400).json({ error: 'Payload error' });
  }
});

// Apply JSON parsing middleware *after* the fast endpoint
app.use(bodyParser.json({ limit: '20mb' }));

// Utility to enforce safe input bounds
function safe(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Simulate load endpoint
app.post('/simulate-load', (req, res) => {
  const cpu = safe(req.body.cpu || 1, 0, 8);
  const ram = safe(req.body.ram || 100, 0, 8192);
  const duration = safe(req.body.duration || 10, 1, 300);

  console.log(`[API] /simulate-load invoked with cpu=${cpu}, ram=${ram}, duration=${duration}`);

  res.json({ status: 'started', cpu, ram, duration });

  try {
    simulateLoad({ cpu, ram, duration });
  } catch (error) {
    console.error(`[ERROR] simulateLoad threw: ${error.message}`, error);
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`[API] Load API running on port ${port}`);
});

// Prevent hanging connections
server.setTimeout(10000); // 10s timeout
