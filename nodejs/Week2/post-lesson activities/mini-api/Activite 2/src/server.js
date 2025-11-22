const express = require('express');
const app = express();
const resourceRoutes = require("./routes/resourceRoutes");

app.use(express.json());
app.use('/api/resources', resourceRoutes); // toutes les routes commenceront par /api/resources

app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API de gestion des ressources !');
 });

const PORT =  3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});