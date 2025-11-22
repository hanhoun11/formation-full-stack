// productsService.js - Ki9ra o kifiltri products
// Service = layer li ki communicate m3a data (JSON files)

// Ki import fs (file system) bach n9ra files
const fs = require('fs');

// Ki import path bach n buildew paths s7a7
const path = require('path');

// Cache dial products f memory (RAM)
// Awel merra ki9ra file, ighadi i5alih hna
// Merra taniya, machi ghadi i9rah tani, ghadi yakhod mn cache
let productsCache = null;

/**
 * Ki9ra products.json (merra wa7da o ikhalih f cache)
 * Hadi function privée, ghir loadProducts() li kat3ayet liha
 */
function loadProducts() {
  // Check ila deja 9rina file (cache kayn)
  if (productsCache) {
    // Rje3 mn cache, machi mn file
    return productsCache;
  }
  
  // Try/catch - Bach nhandelaw errors
  try {
    // path.join() - Ki build path kamil
    // __dirname - Directory li fih had file (src/services/)
    // '../../data/products.json' - Ki tl3 2 niveaux o idkhol l data/
    // Result: /path/to/project/data/products.json
    const filePath = path.join(__dirname, '../../data/products.json');
    
    // fs.readFileSync() - Ki9ra file (synchrone, kiw99ef thread)
    // 'utf-8' - Encoding (bash irje3 string, machi buffer)
    const data = fs.readFileSync(filePath, 'utf-8');
    
    // JSON.parse() - Ki7awel JSON string l JavaScript object/array
    // productsCache = ... - Ki5alih f cache
    productsCache = JSON.parse(data);
    
    // Rje3 data
    return productsCache;
  } catch (error) {
    // Ila kant chi mochkila (file makaynch, JSON invalide...)
    // Ki throw error jadid m3a message wa9e3
    throw new Error('Erreur lecture products.json: ' + error.message);
  }
}

/**
 * Search products m3a filters
 * @param {Object} filters - Object dial filters (q, category, minPrice...)
 * @returns {Object} - { data, total, page, pages }
 */
function search(filters = {}) {
  // Ki9ra products (mn cache wla mn file)
  const products = loadProducts();
  
  // [...products] - Spread operator, ki3mel copy dial array
  // Bash ma n modifiwch l'original
  let results = [...products];
  
  // ========== FILTERS ==========
  
  // Filter 1: Search b query (q)
  if (filters.q) {
    // toLowerCase() - Ki7awel kolchi l lowercase bash search maykon case-sensitive
    const query = filters.q.toLowerCase();
    
    // filter() - Ki5li ghir elements li kat rje3 true
    results = results.filter(p => 
      // includes() - Ki check ila string kayn dakhel string akhor
      // Ki check f name, description, o sku
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    );
  }
  
  // Filter 2: Filter b category
  if (filters.category) {
    // Ki5li ghir products li category dyalhom == filter
    results = results.filter(p => p.category === filters.category);
  }
  
  // Filter 3: Filter b minPrice
  // !== null o !== undefined - Bach n check ila filter kayn
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    // Ki5li ghir products li price >= minPrice
    results = results.filter(p => p.price >= filters.minPrice);
  }
  
  // Filter 4: Filter b maxPrice
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    // Ki5li ghir products li price <= maxPrice
    results = results.filter(p => p.price <= filters.maxPrice);
  }
  
  // Filter 5: Filter b inStock
  if (filters.inStock !== null && filters.inStock !== undefined) {
    // Ki5li ghir products li inStock == filter (true wla false)
    results = results.filter(p => p.inStock === filters.inStock);
  }
  
  // ========== PAGINATION ==========
  
  // Total dial results (9bel pagination)
  const total = results.length;
  
  // Page number (default: 1)
  // || operator - Ila filters.page makaynch, khod 1
  const page = filters.page || 1;
  
  // Limit dial items per page (default: 10)
  const limit = filters.limit || 10;
  
  // startIndex - Index dial awel item f page
  // Exemple: page=1, limit=10 → startIndex = 0
  // Exemple: page=2, limit=10 → startIndex = 10
  const startIndex = (page - 1) * limit;
  
  // endIndex - Index dial akher item f page
  // Exemple: page=1, limit=10 → endIndex = 10
  const endIndex = startIndex + limit;
  
  // slice() - Ki9t3 partie mn array
  // Ki akhod mn startIndex l endIndex
  const paginatedResults = results.slice(startIndex, endIndex);
  
  // ========== RETURN ==========
  
  // Rje3 object m3a data o metadata
  return {
    data: paginatedResults,    // Array dial products (paginated)
    total: total,              // Total dial kolchi (9bel pagination)
    page: page,                // Page li 7na fih
    pages: Math.ceil(total / limit)  // Total dial pages
    // Math.ceil() - Ki tl3 l nearest integer
    // Exemple: 25 items, 10 per page → 25/10 = 2.5 → 3 pages
  };
}

/**
 * Jib product b ID
 * @param {number|string} id - ID dial product
 * @returns {Object|undefined} - Product object wla undefined
 */
function byId(id) {
  // Ki9ra products
  const products = loadProducts();
  
  // find() - Ki return awel element li kat rje3 true
  // parseInt(id) - Ki7awel id l number (ila kant string)
  // Ila malk9ash → undefined
  return products.find(p => p.id === parseInt(id));
}

/**
 * Jib product b SKU
 * @param {string} sku - SKU dial product
 * @returns {Object|undefined} - Product object wla undefined
 */
function bySku(sku) {
  // Ki9ra products
  const products = loadProducts();
  
  // find() - Ki return awel element li sku dyalo == parameter
  // Ila malk9ash → undefined
  return products.find(p => p.sku === sku);
}

// Ki5rej les 3 functions bash n9edro nest3mlohom f controllers
module.exports = {
  search,
  byId,
  bySku
};