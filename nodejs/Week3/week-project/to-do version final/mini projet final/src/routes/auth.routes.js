// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 🧩 Inscription
router.post('/register', authController.register);

// 🧩 Connexion
router.post('/login', authController.login);

module.exports = router;





// Quand un utilisateur veut se connecter,
// il envoie une requête POST à /api/auth/login.
// → Cette route appelle authController.login.

// 📦 But : vérifier les identifiants (email + mot de passe)
// et renvoyer un token JWT si tout est correct.