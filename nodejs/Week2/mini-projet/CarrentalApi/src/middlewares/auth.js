// auth.js
// simple Bearer token auth; protect POST/PUT/DELETE endpoints
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const allowed = process.env.API_TOKEN || 'secret123';
  if (!token || token !== allowed) {
    return res.status(401).json({status: 'error', message: 'Unauthorized', code: 401, timestamp: new Date().toISOString()});
  }
  next();
};