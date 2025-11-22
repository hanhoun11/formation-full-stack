// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
   req.user = {
      id: decoded.id || decoded._id, // ✅ ici la correction
      role: decoded.role
    };
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token invalide' });
  }
};
