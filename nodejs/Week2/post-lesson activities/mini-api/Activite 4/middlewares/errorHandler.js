function errorHandler(err, req, res, next) {
    // Si ce n'est pas un AppError, on transforme
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const timestamp = err.timestamp || new Date().toISOString();

    res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        timestamp
    });
}

module.exports = errorHandler;