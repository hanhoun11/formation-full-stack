// sendJson.js - Ki7ayyed 3lina bach nreddo JSON responses
// Hada file sghir o basit, kheddamo f kolchi bash nreddo JSON

/**
 * Fonction pour envoyer une réponse JSON
 * @param {Object} res - Response object (li katji mn http.createServer)
 * @param {number} statusCode - Code HTTP (200, 404, 400, 500...)
 * @param {Object} data - Data li bghina nreddo f JSON
 */
function sendJson(res, statusCode, data) {
  // res.writeHead() - Ki3ti headers l response
  // statusCode - 200 (OK), 404 (Not Found), 400 (Bad Request)...
  // Headers - kigol lil browser: "hada JSON, machi HTML"
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'  // Important: charset=utf-8 bach y9bel caractères spéciaux
  });
  
  // res.end() - Ki7ayyed response o ikhrejha lil client
  // JSON.stringify() - Ki7awel object JavaScript l string JSON
  // null, 2 - Ki3mel formatting (indentation b 2 spaces) bash ykon lisible
  res.end(JSON.stringify(data, null, 2));
}

// module.exports - Ki5rejha bash n9edro nest3melha f files khrin
module.exports = sendJson;