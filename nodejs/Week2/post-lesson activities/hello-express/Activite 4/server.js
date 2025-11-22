const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenue sur mon premier serveur Express!');
});


app.get('/api/crash', (req, res, next) => {
  const err = new Error('Erreur simulée');
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné!');
});


app.listen(port, () => {
  console.log('serveur en ecoute sur http://localhost:3000');
});
