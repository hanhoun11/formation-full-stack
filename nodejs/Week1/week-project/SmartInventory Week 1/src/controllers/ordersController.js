// ordersController.js - Logic dial orders endpoints

const ordersService = require('../services/ordersService');
const sendJson = require('../utils/sendJson'); //fonction pour envoyer les reponse HTTP en format JSON
const { toNumber, parseDate } = require('../utils/parseQuery');

/**
 * GET /api/orders - List kamla dial orders m3a filters
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} query - Query parameters
 */

function listOrders(req, res, query) {
  try {
    // ========== PARSE QUERY PARAMETERS ==========
    
    const filters = {
      // status - Filter b status (paid, pending, shipped, cancelled)
      status: query.status || null,
      
      // parseDate() - Ki7awel string l Date object
      // from - Date minimale
      from: parseDate(query.from),
      
      // to - Date maximale
      to: parseDate(query.to),
      
      // page o limit - Pagination
      page: toNumber(query.page) || 1,
      limit: toNumber(query.limit) || 10
    };
    
    // ========== VALIDATION: DATES ==========
    
    // Check 1: from date khasso ykon 9bel to date
    // && - both khassehom يكونو kaynin
    if (filters.from && filters.to) {
      // Ila from > to → Error 400
      if (filters.from > filters.to) {
        return sendJson(res, 400, {
          error: 'Bad Request',
          message: 'La date "from" doit être antérieure à la date "to"'
        });
      }
    }
    
    // Check 2: Ila user dar query.from ولكن parseDate() rje3 null
    // Ya3ni: date invalide (machi ISO format)
    if (query.from && !filters.from) {
      return sendJson(res, 400, {
        error: 'Bad Request',
        message: 'Date "from" invalide. Utilisez le format ISO (YYYY-MM-DD)'
      });
    }
    
    // Check 3: Nefs logic l "to"
    if (query.to && !filters.to) {
      return sendJson(res, 400, {
        error: 'Bad Request',
        message: 'Date "to" invalide. Utilisez le format ISO (YYYY-MM-DD)'
      });
    }
    
    // ========== CALL SERVICE ==========
    
    // ordersService.search() - Ki jib orders m3a filters
    const result = ordersService.search(filters);
    
    // ========== SEND RESPONSE ==========
    
    // 200 - OK
    sendJson(res, 200, result);
    
  } catch (error) {
    // 500 - Internal Server Error
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * GET /api/orders/:id - Jib order wa7ed b ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} id - ID dial order
 */
function getOrderById(req, res, id) {
  try {
    // ========== CALL SERVICE ==========
    
    // ordersService.byId() - Ki jib order b ID
    const order = ordersService.byId(id);
    
    // ========== CHECK IF EXISTS ==========
    
    if (!order) {
      // 404 - Not Found
      return sendJson(res, 404, {
        error: 'Not Found',
        message: `Order avec ID ${id} introuvable`
      });
    }
    
    // ========== SEND RESPONSE ==========
    
    // 200 - OK
    sendJson(res, 200, order);
    
  } catch (error) {
    // 500
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * GET /api/orders/number/:orderNumber - Jib order b orderNumber
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} orderNumber - Order number (ex: ORD-2025-0007)
 */
function getOrderByNumber(req, res, orderNumber) {
  try {
    // ========== CALL SERVICE ==========
    
    // ordersService.byOrderNumber() - Ki jib order b orderNumber
    const order = ordersService.byOrderNumber(orderNumber);
    
    // ========== CHECK IF EXISTS ==========
    
    if (!order) {
      // 404 - Not Found
      return sendJson(res, 404, {
        error: 'Not Found',
        message: `Order avec numéro ${orderNumber} introuvable`
      });
    }
    
    // ========== SEND RESPONSE ==========
    
    // 200 - OK
    sendJson(res, 200, order);
    
  } catch (error) {
    // 500
    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// ========== EXPORT ==========

module.exports = {
  listOrders,         // GET /api/orders
  getOrderById,       // GET /api/orders/:id
  getOrderByNumber    // GET /api/orders/number/:orderNumber
};