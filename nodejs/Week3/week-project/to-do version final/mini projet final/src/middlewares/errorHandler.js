// 📁 middlewares/errorHandler.js
// Middleware global bach ycatchi les erreurs w y3ti reponse JSON ma3qula

exports.errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne'
  });
};
