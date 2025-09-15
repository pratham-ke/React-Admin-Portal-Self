const express = require('express');
const path = require('path');
const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

// Serve static build
const buildFolder = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(buildFolder));

// Single page app fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(buildFolder, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Frontend static server running on http://${HOST}:${PORT}`);
});
