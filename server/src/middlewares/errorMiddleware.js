const config = require("../config/config");
const logger = require("../utils/logger");
const ApiResponse = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the fatal trace for system administrators
    logger.error(`${err.message}`, {
        method: req.method,
        path: req.originalUrl,
        stack: err.stack
    });

    // 1. Handle Mongoose Bad ObjectID (CastError)
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid field: ${err.path}`;
        return ApiResponse.error(res, message, 400);
    }

    // 2. Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        let field = "field";
        if (err.keyValue) {
            field = Object.keys(err.keyValue).join(", ");
        } else if (err.message) {
            const match = err.message.match(/(["'])(\\?.)*?\1/);
            if (match) field = match[0];
        }
        const message = `Duplicate value entered for ${field}. Please use another value.`;
        return ApiResponse.error(res, message, 400);
    }


    // 3. Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message).join(", ");
        return ApiResponse.error(res, message, 400);
    }

    // 4. Handle JWT Token Expired
    if (err.name === "TokenExpiredError") {
        return ApiResponse.error(res, "Session has expired. Please login again.", 401);
    }

    // 5. Handle JWT Signature Invalid
    if (err.name === "JsonWebTokenError") {
        return ApiResponse.error(res, "Invalid session verification token.", 401);
    }

    // 6. Handle CORS Origin Rejections
    if (err.message && err.message.startsWith("CORS error")) {
        return ApiResponse.error(res, err.message, 403);
    }

    // Standard Response format (Operational vs System Fatal)
    const statusCode = err.statusCode || 500;

    const message = err.isOperational ? err.message : "Internal server error";

    return ApiResponse.error(
        res,
        message,
        statusCode,
        config.env === "development" && !err.isOperational ? err.stack : null
    );
};

module.exports = errorHandler;
