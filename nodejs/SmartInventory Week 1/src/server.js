// server.js - Server principal (noyau dial application)

// http - import dial module http, utilisé pour créer un serveur HTTP
const http = require('http');

// router module local - s'occupe a diriger les requetes vers les bons controleurs 
const router = require('./router');

// enregistre les événements
const logger = require('./utils/logger');


require('dotenv').config = () => {}; // charge les variables d’un fichier .env
const PORT = process.env.PORT || 3000; // Définit le port d’écoute du serveur :





 // Chaque fois qu’une requête arrive,la fonction (req, res) s’exécute.
 
const server = http.createServer((req, res) => {
  
 //enregistre chauque requete HTTP que le serveur recu
  logger.logRequest(req.method, req.url);
  
  
  // Le serveur veut aussi enregistrer les réponses
  const originalWriteHead = res.writeHead; 
  
  // prépare la réponse (code HTTP + en-têtes)
  res.writeHead = function(statusCode, headers) {
    // N5zen statusCode f res object
    res.statusCode = statusCode;
    
    // Call original function (bash response يخرج normal)
    // this - res object
    // call() - Ki 3ayet function m3a context (this)
    originalWriteHead.call(this, statusCode, headers);
  };
  
  // originalEnd - N5zen original res.end()
  const originalEnd = res.end;
  
  // Override res.end()
  res.end = function(...args) {
    // Hna response غادي يخرج!
    
    // ========== LOG RESPONSE ==========
    
    // logger.logResponse() - Ki log response
    // Ki emit event 'response:sent'
    // Ki print: [timestamp] ← 200 /api/products
    logger.logResponse(res.statusCode, req.url);
    
    // Call original res.end() bash response يخرج
    // apply() - Ki 3ayet function m3a arguments
    originalEnd.apply(this, args);
  };
  

  
  /* analyse l’URL et la méthode (GET, POST) pour déterminer quel contrôleur exécuter */
  router(req, res); 
});


// ========== START SERVER ==========

server.listen(PORT, () => {
  // ========== WELCOME MESSAGE ==========
  
  //on affiche un message dans la console avec les routes disponibles.
  console.log('  🚀 Smart Inventory System - Démarré     ');
  // Template string - Ki insert variables f string
  console.log(`  📡 Serveur: http://localhost:${PORT}       `);
  
  // new Date().toISOString() - Timestamp dial awel merra server بدا
  console.log(` ⏰ Démarré à: ${new Date().toISOString()} `);
  
  console.log('');
  console.log('📋 Routes disponibles:');
  console.log('  - GET /health');
  console.log('  - GET /api/products');
  console.log('  - GET /api/products/:id');
  console.log('  - GET /api/products/sku/:sku');
  console.log('  - GET /api/orders');
  console.log('  - GET /api/orders/:id');
  console.log('  - GET /api/orders/number/:orderNumber');
  console.log('');
});



//Gestion de l’arrêt du serveur
process.on('SIGINT', () => {

  console.log('\n🛑 Arrêt du serveur...');
  
  
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    
    // process.exit(0) - Ki خرج من process
    // 0 - Exit code (0 = success)
    process.exit(0);
  });
});