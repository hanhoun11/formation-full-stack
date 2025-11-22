const express = require("express");
const app = express();
const auth = require("./middlewares/auth");
const timeLimiter = require("./middlewares/timeLimiter");

app.use(express.json()); 

// Route publique (accessible à tous) 
app.get("/api/public", (req, res) => {
  res.json({ message: "Bienvenue sur la route publique 👋" });
});

//Route privée (protégée par les middlewares) 
app.use("/api/private", auth, timeLimiter); // on applique les deux middlewares ici

app.get("/api/private", (req, res) => {
  res.json({ message: "Bienvenue sur la route privée 🔐" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});