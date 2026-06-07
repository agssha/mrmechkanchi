const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

// Define standard CORS setup
const corsMiddleware = cors({
    origin: "*", // Keep identical to original server configuration for API compatibility
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
});

// Configure Helmet security headers (with support for CDN scripts if needed)
const helmetMiddleware = helmet({
    contentSecurityPolicy: false // Disabled for APIs to facilitate cross-origin operations
});

// Configure request rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    message: { message: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 authentication or booking requests per window
    message: { message: "Too many verification or request attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

// Recursive in-place NoSQL Query Injection Sanitizer compatible with Express v5
const sanitizeObject = (obj) => {
    if (obj && typeof obj === "object") {
        Object.keys(obj).forEach(key => {
            // Drop keys starting with MongoDB operator indicators ($) or containing query path delimiters (.)
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
            } else if (typeof obj[key] === "object") {
                sanitizeObject(obj[key]);
            }
        });
    }
};

// Custom Sanitization middleware compatible with Express v5's query object getter
const sanitizeMiddleware = (req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
};

module.exports = {
    corsMiddleware,
    helmetMiddleware,
    generalLimiter,
    authLimiter,
    sanitizeMiddleware
};
