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

// Map to track active/recent request signatures
const requestLocks = new Map();

// Periodic cleanup loop to prevent memory accumulation
setInterval(() => {
    const now = Date.now();
    for (const [key, lock] of requestLocks.entries()) {
        if (lock.status === "cooling" && now - lock.timestamp > 3000) {
            requestLocks.delete(key);
        } else if (lock.status === "in-flight" && now - lock.timestamp > 30000) {
            requestLocks.delete(key); // Auto-expire hung requests after 30s
        }
    }
}, 5000);

const duplicatePreventer = (windowMs = 3000) => {
    return (req, res, next) => {
        if (req.method === "GET" || req.method === "OPTIONS") {
            return next();
        }

        const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
        const path = req.originalUrl || req.url;
        let bodyStr = "";
        if (req.body && Object.keys(req.body).length > 0) {
            bodyStr = JSON.stringify(req.body);
        }
        const signature = `${ip}:${path}:${bodyStr}`;
        const now = Date.now();

        if (requestLocks.has(signature)) {
            const lock = requestLocks.get(signature);
            if (lock.status === "in-flight") {
                return res.status(409).json({
                    success: false,
                    message: "A duplicate request is already in progress. Please wait."
                });
            } else if (lock.status === "cooling" && now - lock.timestamp < windowMs) {
                return res.status(409).json({
                    success: false,
                    message: "Duplicate submission detected. Please wait a moment."
                });
            }
        }

        // Lock signature as in-flight
        requestLocks.set(signature, {
            status: "in-flight",
            timestamp: now
        });

        const releaseLock = () => {
            if (requestLocks.has(signature)) {
                const current = requestLocks.get(signature);
                if (current && current.status === "in-flight") {
                    requestLocks.set(signature, {
                        status: "cooling",
                        timestamp: Date.now()
                    });
                    
                    setTimeout(() => {
                        requestLocks.delete(signature);
                    }, windowMs);
                }
            }
        };

        res.on("finish", releaseLock);
        res.on("close", releaseLock);

        next();
    };
};

module.exports = {
    corsMiddleware,
    helmetMiddleware,
    generalLimiter,
    authLimiter,
    sanitizeMiddleware,
    duplicatePreventer
};
