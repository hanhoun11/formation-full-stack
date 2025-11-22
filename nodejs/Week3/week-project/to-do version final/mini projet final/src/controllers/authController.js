// 📁 controllers/authController.js
// Contrôleur pour gérer l'inscription et la connexion des utilisateurs

const User = require('../models/user'); // Modèle Mongoose pour la collection "users"
const jwt = require('jsonwebtoken');   // Librairie pour créer et vérifier les tokens JWT
const bcrypt = require('bcryptjs');    // Librairie pour hasher et comparer les mots de passe

// 🧩 Inscription d'un nouvel utilisateur
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body; 
    // Récupération des données envoyées par le client (email, mot de passe et rôle)

    // 🔎 Vérifier si l'email existe déjà dans la base
    const existingUser = await User.findOne({ email });
    if (existingUser) // Si un utilisateur avec cet email existe déjà
      return res.status(409).json({ message: 'Email déjà utilisé' }); 
      // On renvoie un code 409 (conflit) avec un message

    // 🔒 Créer un nouvel utilisateur (le mot de passe sera automatiquement hashé si le pré-save est défini dans le modèle)
    const user = new User({ email, password, role });
    await user.save(); // Enregistrer l'utilisateur dans la base de données

    // ✅ Réponse en cas de succès
    res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
  } catch (err) {
    next(err); // En cas d'erreur, passer l'erreur au middleware de gestion d'erreurs
  }
};

// 🧩 Connexion d'un utilisateur existant
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body; 
    // Récupération des données envoyées par le client (email et mot de passe)

    // 🔎 Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) // Si l'utilisateur n'existe pas
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
      // Code 401 : non autorisé

    // 🔐 Vérifier si le mot de passe correspond
    const isMatch = await bcrypt.compare(password, user.password); 
    // bcrypt.compare() compare le mot de passe envoyé avec le mot de passe hashé en base
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });

    // 🪙 Générer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload : informations que l'on veut stocker dans le token
      process.env.JWT_SECRET || 'secretkey', // Clé secrète pour signer le token
      { expiresIn: '1h' } // Durée de validité du token
    );

    // ✅ Réponse en cas de succès avec le token
    res.json({
      message: 'Connexion réussie',
      token
    });
  } catch (err) {
    next(err); // En cas d'erreur, passer l'erreur au middleware de gestion d'erreurs
  }
};
