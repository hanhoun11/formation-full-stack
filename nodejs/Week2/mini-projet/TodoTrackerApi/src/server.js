// 📁 server.js
// hada lmain file li kaybda bih lserver

const express = require('express');
const morgan = require('morgan');
const todoRoutes = require('./routes/todoRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = 3000;

// باش نقدر نقرا body dyal POST sous format JSON
app.use(express.json());

// logger bach n3rf ach kayt executa f chaque requete
app.use(morgan('dev'));

// les routes principales, montage du routeur
app.use('/api/todos', todoRoutes);

// middleware global dyal les erreurs
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server kaykhddem f http://localhost:${PORT}`);
});

