// logger.js - Ki3mel logging b EventEmitter
// EventEmitter = système dial events (emit o listen)

// Ki import EventEmitter mn Node.js
const EventEmitter = require('events');

/**
 * Logger class - kiwareth mn EventEmitter
 * Ki3mel emit dial events: request:received o response:sent
 */
class Logger extends EventEmitter {
  // constructor - Kifexecuta awel merra ki n5el9o instance
  constructor() {
    // super() - Ki call constructor dial EventEmitter (parent class)
    super();
    
    // this.on() - Kifregister listener l event
    // Ki nsm3o l event 'request:received'
    this.on('request:received', ({ method, url }) => {
      // new Date().toISOString() - Ki5rejlna timestamp format ISO
      // Exemple: "2025-10-27T10:30:45.123Z"
      const timestamp = new Date().toISOString();
      
      // Ki print f console: [timestamp] → GET /api/products
      console.log(`[${timestamp}] → ${method} ${url}`);
    });
    
    // Ki nsm3o l event 'response:sent'
    this.on('response:sent', ({ statusCode, route }) => {
      const timestamp = new Date().toISOString();
      
      // Ki print f console: [timestamp] ← 200 /api/products
      console.log(`[${timestamp}] ← ${statusCode} ${route}`);
    });
  }
  
  /**
   * Log request li dakhel
   * Method bach n3awto mn server.js
   */
  logRequest(method, url) {
    // this.emit() - Ki3mel emit dial event
    // Ki9ol: "event 'request:received' wq3, o hado data dialo"
    this.emit('request:received', { method, url });
  }
  
  /**
   * Log response li khrej
   * Method bach n3awto mn server.js
   */
  logResponse(statusCode, route) {
    // Ki emit event 'response:sent'
    this.emit('response:sent', { statusCode, route });
  }
}

// N5el9o instance wa7da (singleton pattern)
// Haka kolchi ighadi yst3mel nefs Logger
const logger = new Logger();

// Ki5rejha bash n9edro nest3melha
module.exports = logger;