// productsController.js - Logic dial products endpoints
// Controller = intermediaire bin router o service
// Ki akhod request, ki validate, ki 3ayet service, ki rje3 response

// Ki import service dial products
const productsService = require('../services/productsService');

// Ki import sendJson bash nreddo responses
const sendJson = require('../utils/sendJson');

// Ki import helpers dial parsing
const { toNumber, toBool } = require('../utils/parseQuery');

/**
 * GET /api/products - List kamla dial products m3a filters
 * @param {Object} req - Request object (mn http.createServer)
 * @param {Object} res - Response object
 * @param {Object} query - Query parameters (mn URL)
 */
function listProducts(req, res, query) {
  // try/catch - Bach nhandelaw errors (500)
  try {
    // ========== PARSE QUERY PARAMETERS ==========
    
    // Ki buildew object dial filters mn query parameters
    const filters = {
      // query.q - Search text (optional, default: null)
      // || null - Ila makaynch, rje3 null
      q: query.q || null,
      
      // query.category - Category filter (optional)
      category: query.category || null,
      
      // toNumber() - Ki7awel string l number
      // query.minPrice - Prix minimum (optional)
      minPrice: toNumber(query.minPrice),
      
      // query.maxPrice - Prix maximum (optional)
      maxPrice: toNumber(query.maxPrice),
      
      // toBool() - Ki7awel string l boolean
      // query.inStock - Filter par stock (optional)
      inStock: toBool(query.inStock),
      
      // toNumber() o default 1 - Page number
      page: toNumber(query.page) || 1,
      
      // toNumber() o default 10 - Items per page
      limit: toNumber(query.limit) || 10
    };
    
    // ========== VALIDATION ==========
    
    // Check: minPrice khasso ykon a9al mn maxPrice
    // !== null - Ki check ila both kaynin (machi null)
    if (filters.minPrice !== null && filters.maxPrice !== null) {
      // Ila minPrice > maxPrice → Error 400 (Bad Request)
      if (filters.minPrice > filters.maxPrice) {
        // sendJson() - Ki rje3 JSON response
        // 400 - Bad Request (query invalide)
        return sendJson(res, 400, {
          error: 'Bad Request',
          message: 'minPrice doit être inférieur ou égal à maxPrice'
        });
      }
    }
    
    // ========== CALL SERVICE ==========
    
    // productsService.search() - Ki jib products m3a filters
    // result = { data: [...], total: 50, page: 1, pages: 5 }
    const result = productsService.search(filters);
    
    // ========== SEND RESPONSE ==========
    
    // 200 - OK (success)
    sendJson(res, 200, result);
    
  } catch (error) {
    // Ila kant chi error (file ma9rinach, JSON invalide...)
    // 500 - Internal Server Error
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message  // Message dial error (mn service)
    });
  }
}

/**
 * GET /api/products/:id - Jib product wa7ed b ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} id - ID dial product (mn URL parameter)
 */
function getProductById(req, res, id) {
  try {
    // ========== CALL SERVICE ==========
    
    // productsService.byId() - Ki jib product b ID
    // Rje3: product object wla undefined (ila makaynch)
    const product = productsService.byId(id);
    
    // ========== CHECK IF EXISTS ==========
    
    // Ila product makaynch (undefined)
    if (!product) {
      // 404 - Not Found
      return sendJson(res, 404, {
        error: 'Not Found',
        message: `Product avec ID ${id} introuvable`
      });
    }
    
    // ========== SEND RESPONSE ==========
    
    // 200 - OK, rje3 product
    sendJson(res, 200, product);
    
  } catch (error) {
    // Error 500
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * GET /api/products/sku/:sku - Jib product b SKU
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} sku - SKU dial product (mn URL parameter)
 */
function getProductBySku(req, res, sku) {
  try {
    // ========== CALL SERVICE ==========
    
    // productsService.bySku() - Ki jib product b SKU
    const product = productsService.bySku(sku);
    
    // ========== CHECK IF EXISTS ==========
    
    // Ila product makaynch
    if (!product) {
      // 404 - Not Found
      return sendJson(res, 404, {
        error: 'Not Found',
        message: `Product avec SKU ${sku} introuvable`
      });
    }
    
    // ========== SEND RESPONSE ==========
    
    // 200 - OK
    sendJson(res, 200, product);
    
  } catch (error) {
    // Error 500
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// ========== EXPORT ==========

// Ki5rej les 3 functions bash router i9der i3ayet lihom
module.exports = {
  listProducts,       // GET /api/products
  getProductById,     // GET /api/products/:id
  getProductBySku     // GET /api/products/sku/:sku
};