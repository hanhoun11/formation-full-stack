// logger.js
// middleware li kay7seb duration w kayprint log format: "[ISO] METHOD URL -> STATUS in Xms"
module.exports = (req, res, next) => {
  const start = Date.now();
  const iso = new Date().toISOString();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${iso}] ${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms}ms`);
  });
  next();
};