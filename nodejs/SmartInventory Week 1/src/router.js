// router.js - Ki7aded route o ikhalik li controller s7i7
// Hada هو "المرشد" dial application, kiفرق bin routes

// Ki import url module (built-in f Node.js)
const url = require('url');

// Ki import controllers
const productsController = require('./controllers/productsController');
const ordersController = require('./controllers/ordersController');
const exportController = require('./controllers/exportController.js');  
// Ki import sendJson
const sendJson = require('./utils/sendJson'

);

/**
 * Function bach nchofo wach route tat-match m3a pattern
 * Exemple: matchRoute('/api/products/123', '/api/products/:id')
 * → { matched: true, params: { id: '123' } }
 * 
 * @param {string} pathname - URL actual (ex: /api/products/123)
 * @param {string} pattern - Pattern li bghina n check (ex: /api/products/:id)
 * @returns {Object} - { matched: boolean, params: {...} }
 */
function matchRoute(pathname, pattern) {
  // split('/') - Ki9s3 string b '/'
  // Exemple: '/api/products/123' → ['', 'api', 'products', '123']
  // filter(s => s) - Ki7yyed empty strings
  // Result: ['api', 'products', '123']
  const pathnameSegments = pathname.split('/').filter(s => s);
  
  // Nefs logic lil pattern
  // Exemple: '/api/products/:id' → ['api', 'products', ':id']
  const patternSegments = pattern.split('/').filter(s => s);
  
  // ========== CHECK LENGTH ==========
  
  // Ila length machi nefs شي → machi match
  // Exemple: /api/products (2 segments) ≠ /api/products/:id (3 segments)
  if (pathnameSegments.length !== patternSegments.length) {
    return { matched: false };
  }
  
  // ========== LOOP & COMPARE ==========
  
  // Object bach n5zeno parameters (ex: { id: '123' })
  const params = {};
  
  // Ki loopew 3la segments
  for (let i = 0; i < patternSegments.length; i++) {
    // Check ila segment يبدا b ':' (dynamic parameter)
    if (patternSegments[i].startsWith(':')) {
      // Dynamic segment (ex: :id, :sku, :orderNumber)
      
      // slice(1) - Ki7yyed ':' o يخلي ghir name
      // Exemple: ':id' → 'id'
      const paramName = patternSegments[i].slice(1);
      
      // Ki5zen value dial parameter
      // Exemple: params['id'] = '123'
      params[paramName] = pathnameSegments[i];
      
    } else {
      // Static segment (ex: 'api', 'products')
      
      // Ki check ila segment == segment
      // Ila machi nefs شي → machi match
      if (patternSegments[i] !== pathnameSegments[i]) {
        return { matched: false };
      }
    }
  }
  
  // ========== RETURN ==========
  
  // Ila kamlo o kolchi matched → rje3 true + params
  return { matched: true, params };
}

/**
 * Router principal - ki7awel kolchi
 * Hada function li server.js ighadi i3ayet liha
 * 
 * @param {Object} req - Request object (mn http.createServer)
 * @param {Object} res - Response object
 */
function router(req, res) {
  // ========== PARSE URL ==========
  
  // url.parse() - Ki7alel URL
  // req.url - Full URL (ex: /api/products?page=1&limit=10)
  // true - Ki parse query string l object
  // Result: { pathname: '/api/products', query: { page: '1', limit: '10' } }
  const parsedUrl = url.parse(req.url, true);
  
  // pathname - Path dial URL (bla query)
  const pathname = parsedUrl.pathname;
  
  // query - Query parameters (as object)
  const query = parsedUrl.query;
  
  // method - HTTP method (GET, POST, PUT, DELETE...)
  const method = req.method;
 if (method === 'GET' && pathname === '/') {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello - Smart Inventory</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #8fbfecff 0%, #4596f3ff 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        h1 {
            font-size: 4em;
            color: #667eea;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.5em;
            color: #666;
            margin-bottom: 30px;
        }
        .emoji {
            font-size: 5em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">👋</div>
        <h1>Hello!</h1>
        <p>Bienvenue sur Smart Inventory System</p>
        <p style="font-size: 1.2em; color: #999;">API Node.js - Week 1</p>
    </div>
</body>
</html>
    `;
    
    // Ki rje3 HTML
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(html);
    return;
  }
  // ========== ROUTE: GET /health ==========
  
  // Health check endpoint - Ki check ila server kheddام
  if (method === 'GET' && pathname === '/health') {
    // process.uptime() - Wa9t li server kheddام (f seconds)
    const uptime = process.uptime();
    
    // new Date().toISOString() - Current timestamp
    const timestamp = new Date().toISOString();
    
    // Rje3 JSON m3a status, uptime, timestamp
    return sendJson(res, 200, {
      status: 'ok',
      uptime: uptime,
      timestamp: timestamp
    });
  }
  
  // ========== ROUTE: GET /api/products ==========
  
  // List kamla dial products
  if (method === 'GET' && pathname === '/api/products') {
    // Ki 3ayet controller
    // req, res, query - Ki 3tihom l controller
    return productsController.listProducts(req, res, query);
  }
  
  // ========== ROUTE: GET /api/products/sku/:sku ==========
  
  // IMPORTANT: Hada route khasso يكون 9BEL /api/products/:id
  // 3lach? Bash 'sku' mayتاخذوهش ka ID!
  
  // matchRoute() - Ki check ila pathname tat-match m3a pattern
  const skuMatch = matchRoute(pathname, '/api/products/sku/:sku');
  
  // Ila matched (ex: /api/products/sku/SKU-001)
  if (method === 'GET' && skuMatch.matched) {
    // skuMatch.params.sku - Value dial SKU (ex: 'SKU-001')
    return productsController.getProductBySku(req, res, skuMatch.params.sku);
  }
  
  // ========== ROUTE: GET /api/products/:id ==========
  
  // Get product by ID
  const productIdMatch = matchRoute(pathname, '/api/products/:id');
  
  if (method === 'GET' && productIdMatch.matched) {
    // productIdMatch.params.id - Value dial ID (ex: '123')
    return productsController.getProductById(req, res, productIdMatch.params.id);
  }
  
  // ========== ROUTE: GET /api/orders ==========
  
  // List kamla dial orders
  if (method === 'GET' && pathname === '/api/orders') {
    return ordersController.listOrders(req, res, query);
  }
  
  // ========== ROUTE: GET /api/orders/number/:orderNumber ==========
  
  // IMPORTANT: Hada route khasso يكون 9BEL /api/orders/:id
  const orderNumberMatch = matchRoute(pathname, '/api/orders/number/:orderNumber');
  
  if (method === 'GET' && orderNumberMatch.matched) {
    // orderNumberMatch.params.orderNumber - ex: 'ORD-2025-0007'
    return ordersController.getOrderByNumber(req, res, orderNumberMatch.params.orderNumber);
  }
  
  // ========== ROUTE: GET /api/orders/:id ==========
  
  // Get order by ID
  const orderIdMatch = matchRoute(pathname, '/api/orders/:id');
  
  if (method === 'GET' && orderIdMatch.matched) {
    return ordersController.getOrderById(req, res, orderIdMatch.params.id);
  }
  // ========== ROUTE: GET /api/export.gz ==========

  if (method === 'GET' && req.url === '/API/export.gz') {
    return exportController.exportCompressedProducts(req, res, query);
  }
  // ========== 404 - NOT FOUND ==========
  
  // Ila ما لقيناش route → 404
  // Hada catch-all (آخر شي ki check)
  sendJson(res, 404, {
    error: 'Not Found',
    message: `Route ${method} ${pathname} n'existe pas`
  });
}

// ========== EXPORT ==========

module.exports = router;