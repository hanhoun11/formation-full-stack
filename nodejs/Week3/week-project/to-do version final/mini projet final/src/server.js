// 📁 server.js
// hada lmain file li kaybda bih lserver

const express = require('express'); // framework dyal Node.js
const morgan = require('morgan');// logger dyal les requetes HTTP
const todoRoutes = require('./routes/todoRoutes'); // routes dyal todo
const { errorHandler } = require('./middlewares/errorHandler'); // middleware dyal les erreurs
const authRoutes = require('./routes/auth.routes');// routes dyal authentication
const connectDB = require('./config/db');// fonction dyal connexion m3a la base de données
const helmet = require('helmet'); // sécurité dyal HTTP headers
const cors = require('cors'); // permet à d’autres domaines (comme le front-end) d’accéder à l’API.
const rateLimit = require('express-rate-limit'); // limite le nombre de requêtes pour éviter le spam ou DDoS.
connectDB();

const app = express();
const PORT = 3000;

// middlwares de configuration
app.use(express.json());
app.use(helmet()); // ajoute des protections HTTP automatiques.
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
app.use('/api/auth', authRoutes);


// logger bach n3rf ach kayt executa f chaque requete
app.use(morgan('dev'));

// les routes principales
app.use('/api/todos', todoRoutes);

// middleware global dyal les erreurs
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server kaykhddem f http://localhost:${PORT}`);
});

















