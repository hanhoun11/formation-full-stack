// server.js
// bootstrap Express
const express = require('express');
const fs = require('fs'); //module Node.js pour lire/écrire des fichiers (utile pour stocker les données JSON).
const path = require('path'); //permet de gérer les chemins de fichiers proprement.
const morgan = require('morgan');
require('dotenv').config(); //charge les variables d’environnement depuis un fichier .env

//les routes pour gerer les endpoints
const carsRouter = require('./routes/cars');
const rentalsRouter = require('./routes/rentals');
//les middlewares personnalisés
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// permet de comprendre les requêtes JSON
app.use(express.json());

// active le logging des requêtes HTTP
app.use(logger);



// mount routers
app.use('/api/cars', carsRouter);
app.use('/api/rentals', rentalsRouter);

// health
app.get('/health', (req, res) => {
  res.json({status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString()});
});

// Sert les fichiers statiques comme HTML, CSS, images depuis le dossier /public.
app.use(express.static(path.join(__dirname, '..', 'public')));

// error handler (final middleware)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});