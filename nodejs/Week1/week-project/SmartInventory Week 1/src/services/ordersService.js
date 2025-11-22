// ordersService.js - Ki9ra o kifiltri orders
// Nefs logic dial productsService, ولكن للطلبات

const fs = require('fs');
const path = require('path');

// Cache dial orders f memory
let ordersCache = null;

/**
 * Ki9ra orders.json (merra wa7da o ikhalih f cache)
 */
function loadOrders() {
  // Ila cache kayn, rje3 meno
  if (ordersCache) {
    return ordersCache;
  }
  
  try {
    // Ki build path: src/services/ → data/orders.json
    const filePath = path.join(__dirname, '../../data/orders.json');
    
    // Ki9ra file (synchrone)
    const data = fs.readFileSync(filePath, 'utf-8');
    
    // Ki7awel JSON l object o ي5alih f cache
    ordersCache = JSON.parse(data);
    
    return ordersCache;
  } catch (error) {
    // Ila kant error, throw error wa9e3
    throw new Error('Erreur lecture orders.json: ' + error.message);
  }
}

/**
 * Search orders m3a filters
 * @param {Object} filters - { status, from, to, page, limit }
 * @returns {Object} - { data, total, page, pages }
 */
function search(filters = {}) {
  // Ki9ra orders mn cache/file
  const orders = loadOrders();
  
  // Ki3mel copy bach ma n modifiwch l'original
  let results = [...orders];
  
  // ========== FILTERS ==========
  
  // Filter 1: Status dial order (paid, pending, shipped, cancelled)
  if (filters.status) {
    // Ki5li ghir orders li status dyalhom == filter
    results = results.filter(o => o.status === filters.status);
  }
  
  // Filter 2: Date minimale (from)
  if (filters.from) {
    // new Date(o.date) - Ki7awel date string l Date object
    // >= filters.from - Ki check ila date >= from
    results = results.filter(o => new Date(o.date) >= filters.from);
  }
  
  // Filter 3: Date maximale (to)
  if (filters.to) {
    // Ki5li ghir orders li date <= to
    results = results.filter(o => new Date(o.date) <= filters.to);
  }
  
  // ========== PAGINATION ==========
  
  // Total 9bel pagination
  const total = results.length;
  
  // Page o limit (defaults: 1 o 10)
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  
  // Calcul dial start o end index
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Ki9t3 results selon pagination
  const paginatedResults = results.slice(startIndex, endIndex);
  
  // ========== RETURN ==========
  
  return {
    data: paginatedResults,
    total: total,
    page: page,
    pages: Math.ceil(total / limit)
  };
}

/**
 * Jib order b ID
 */
function byId(id) {
  const orders = loadOrders();
  
  // find() - Ki return awel order li id dyalo == parameter
  return orders.find(o => o.id === parseInt(id));
}

/**
 * Jib order b orderNumber
 */
function byOrderNumber(orderNumber) {
  const orders = loadOrders();
  
  // find() - Ki return awel order li orderNumber dyalo == parameter
  return orders.find(o => o.orderNumber === orderNumber);
}

// Ki5rej functions
module.exports = {
  search,
  byId,
  byOrderNumber
};