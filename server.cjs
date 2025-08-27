const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let highscores = [];

// GET all highscores
app.get('/api/highscores', (req, res) => {
  res.json(highscores);
});

// POST a new highscore
app.post('/api/highscores', (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid highscore data' });
  }
  highscores.push({ name, score });
  highscores.sort((a, b) => b.score - a.score);
  highscores = highscores.slice(0, 10); // keep top 10
  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Highscore API running on port ${PORT}`);
});
