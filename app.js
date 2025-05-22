const express = require('express');
const bodyParser = require('body-parser');
const { simulateLoad } = require('./load');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/simulate-load', (req, res) => {
  const { cpu = 1, ram = 100, duration = 10 } = req.body;

  console.log(`Simulating load: ${cpu} CPU, ${ram}MB RAM for ${duration}s`);
  simulateLoad({ cpu, ram, duration });

  res.json({ status: 'started', cpu, ram, duration });
});

app.listen(port, () => {
  console.log(`Load API running on port ${port}`);
});
