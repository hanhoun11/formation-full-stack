class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.timestamp = new Date().toISOString();
        this.isOperational = true; // permet de distinguer les erreurs attendues des bugs
    }
}

module.exports = AppError;