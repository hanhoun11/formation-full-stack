module.exports = (req, res, next) => {
  const hour = new Date().getHours();

  if (hour >= 22 || hour < 6) {
    return res.status(403).json({
      status: "error",
      message: "Accès interdit la nuit 🌙 (entre 22h et 6h)"
    });
  }

  next(); // sinon, continuer
};