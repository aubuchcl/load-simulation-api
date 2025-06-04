const express = require('express');
const bodyParser = require('body-parser');
const { simulateLoad } = require('./load');

const app = express();
const port = process.env.PORT || 3000;

// 🚀 Define fast /accept-payload route BEFORE body-parser is applied
app.post('/accept-payload', (req, res) => {
  console.log('GOT 16MB');

  // Consume request stream without triggering body-parser
  req.on('data', () => {});
  req.on('end', () => {
    res.status(200).end();
  });
});

// ✅ Apply body-parser only to remaining routes
app.use(bodyParser.json({ limit: '20mb' }));

// Utility to enforce safe input bounds
function safe(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Load simulation endpoint
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

let cacheHitCount = 0;

app.post('/cache', (req, res) => {
  cacheHitCount++;
  console.log(`[CACHE] Hit #${cacheHitCount}`);

  req.on('data', () => {});
  req.on('end', () => {
    res.status(200).json({ ok: true, count: cacheHitCount });
  });

  req.on('error', (err) => {
    console.error(`[CACHE] Error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).send('Request error');
    }
  });
});


  // Drain the body to ensure 'end' is called
  req.on('data', () => {});
});



// Start server
const server = app.listen(port, () => {
  console.log(`[API] Load API running on port ${port}`);
});

server.setTimeout(10000);
