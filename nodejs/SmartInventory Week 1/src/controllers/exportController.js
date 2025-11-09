// controllers/exportController.js

// ======= IMPORT MODULES =======

// zlib: module dial Node.js li kay khdem b compression (gzip, gunzip...)
const zlib = require('zlib');

// crypto: module dial Node.js li kaydir l'cryptographie (hash, hmac...)
const crypto = require('crypto');

// dotenv: bach nqraw les variables men .env (secret keys, configs...)
require('dotenv').config();

// Ki importina service dial products bach njib data mn JSON
const productsService = require('../services/productsService');


// ======= FUNCTION PRINCIPALE =======
// Hadi hiya li ghadi t'executa mlli client ydir GET /api/export.gz
async function exportCompressedProducts(req, res) {
  try {
    // 1️⃣ - Ki jib kolchi men service (list dial products)
    // productsService.search({}) → kayrje3 array dial produits
    const products = await productsService.search({});
    
    // 2️⃣ - Ki7awal data l JSON string (bash n9dro ncompressiwha)
    const jsonData = JSON.stringify(products);

    // 3️⃣ - Ki compressi JSON b zlib.gzip
    // zlib.gzip(data, callback) → callback fiha (err, compressedBuffer)
    zlib.gzip(jsonData, (err, compressed) => {
      // Ila wa9a chi error f compression
      if (err) {
        // Ki seti l status 500 (server error)
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        // Ki rje3 message simple
        return res.end('Error compressing data');
      }

      // 4️⃣ - Ki jib secret mn .env, ila ma kaynach ydir default
      const secret = process.env.HMAC_SECRET || 'default_secret';

      // 5️⃣ - Ki7seb HMAC signature b algorithme SHA256
      // createHmac('sha256', secret) → ykhdem b clé li f .env
      // update(compressed) → ydir hash 3la les données compressées
      // digest('hex') → ykhrjha b format hexadecimal
      const signature = crypto
        .createHmac('sha256', secret)
        .update(compressed)
        .digest('hex');

      // 6️⃣ - Ki seti les headers bach l client y3ref belli fichier gzip
      // - Content-Type: type dial fichier (application/gzip)
      // - Content-Disposition: bach ydownload fichier b smiya "products.json.gz"
      // - X-Signature: l signature li sniyna biha fichier
      res.writeHead(200, {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="products.json.gz"',
        'X-Signature': signature,
      });

      // 7️⃣ - Ki sfti l fichier compressé l client
      res.end(compressed);
    });
  } catch (error) {
    // Ila wa9a chi erreur unexpected f try block
    // Ki seti status 500
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    // Ki rje3 message simple
    res.end('Internal server error');
  }
}

// ======= EXPORT =======
// Ki exportina function bach router y3ref y3ayet liha
module.exports = { exportCompressedProducts };