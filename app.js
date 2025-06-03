const express = require('express');
const bodyParser = require('body-parser');
const { simulateLoad } = require('./load');

const app = express();
const port = process.env.PORT || 3000;

// Allow up to 20MB JSON payloads
app.use(bodyParser.json({ limit: '20mb' }));

// Utility to enforce safe input bounds
function safe(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Main load simulation endpoint
app.post('/simulate-load', (req, res) => {
  const cpu = safe(req.body.cpu || 1, 0, 8);
  const ram = safe(req.body.ram || 100, 0, 8192); // Max 8GB RAM
  const duration = safe(req.body.duration || 10, 1, 300); // Max 5 minutes

  console.log(`[API] /simulate-load invoked with cpu=${cpu}, ram=${ram}, duration=${duration}`);

  res.json({ status: 'started', cpu, ram, duration });

  try {
    simulateLoad({ cpu, ram, duration });
  } catch (error) {
    console.error(`[ERROR] simulateLoad threw: ${error.message}`, error);
  }
});

// High-speed accept-payload endpoint
app.post('/accept-payload', (req, res) => {
  console.log('GOT 16MB');

  // Consume request stream without processing
  req.on('data', () => {});
  req.on('end', () => {
    res.status(200).end();
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`[API] Load API running on port ${port}`);
});

// Prevent hanging requests
server.setTimeout(10000); // 10 seconds
