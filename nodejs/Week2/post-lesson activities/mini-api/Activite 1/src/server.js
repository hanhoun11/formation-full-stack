// server.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware global (logger)
app.use(morgan('dev'));

// Routes principales
app.get('/api', (req, res) => {
  res.send('Hello');
});

app.get('/api/info', (req, res) => {
  res.json({
    name: "project1",
    version: "1.0.1",
    date: new Date().toISOString()
  });
});

// Middleware de gestion d’erreurs (toujours à la fin)
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});