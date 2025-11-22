// parseQuery.js - Ki7awel query parameters mn string l types s7i7in
// Exemple: "10" → 10 (number), "true" → true (boolean)

/**
 * Convertir string → number
 * Exemple: toNumber("10") → 10
 * Exemple: toNumber("abc") → null
 * Exemple: toNumber("") → null
 */
function toNumber(value) {
  // Check ila value khawya wla undefined
  if (value === undefined || value === null || value === '') {
    return null;  // Rje3 null
  }
  
  // Number() - Ki7awel string l number
  const num = Number(value);
  
  // isNaN() - Ki check ila number valide wla la
  // Ila machi number valide → rje3 null
  // Ila number valide → rje3 dak number
  return isNaN(num) ? null : num;
}

/**
 * Convertir string → boolean
 * Exemple: toBool("true") → true
 * Exemple: toBool("false") → false
 * Exemple: toBool("1") → true
 * Exemple: toBool("abc") → null
 */
function toBool(value) {
  // Check ila value == 'true' wla '1'
  if (value === 'true' || value === '1') return true;
  
  // Check ila value == 'false' wla '0'
  if (value === 'false' || value === '0') return false;
  
  // Ila machi boolean valide → rje3 null
  return null;
}

/**
 * Convertir string → Date
 * Exemple: parseDate("2024-01-01") → Date object
 * Exemple: parseDate("abc") → null
 */
function parseDate(dateStr) {
  // Check ila dateStr khawya
  if (!dateStr) return null;
  
  // new Date() - Ki5le9 Date object mn string
  const date = new Date(dateStr);
  
  // date.getTime() - Kirje3 timestamp (milliseconds)
  // isNaN() - Ki check ila date valide wla la
  // Ila date invalide → rje3 null
  // Ila date valide → rje3 Date object
  return isNaN(date.getTime()) ? null : date;
}

// Ki5rej les 3 functions bash n9edro nest3mlohom
module.exports = {
  toNumber,
  toBool,
  parseDate
};