const express = require('express');
const path = require('path');

const app = express();
const INDEX_FILE = 'index.html';

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api', (req, res) => {
  res.send('Test endpoint message');
});

app.get('*', (req, res) => {
  res.sendFile(INDEX_FILE, {
    root: __dirname
  });
});

const PORT = 3000;

app.listen(PORT);
