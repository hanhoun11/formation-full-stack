module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token === "0000") {
    next(); // le token est bon → on passe à la suite
  } else {
    res.status(401).json({
      status: "error",
      message: "Accès refusé : token invalide ou manquant 🔒"
    });
  }
};