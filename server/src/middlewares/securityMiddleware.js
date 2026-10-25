const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

const config = require("../config/config");

// Define hardened CORS setup with explicit allowed origins
const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, same-origin, curl, server-to-server)
        if (!origin) return callback(null, true);

        const allowed = config.cors.allowedOrigins;
        if (allowed.includes("*") || allowed.includes(origin)) {
            return callback(null, true);
        }

        // Allow localhost/127.0.0.1 in non-production
        if (config.env !== "production" && (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
            return callback(null, true);
        }

        return callback(new Error(`CORS error: Request origin '${origin}' is not authorized.`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
});

// Configure Helmet security headers with tuned Content Security Policy
const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.tailwindcss.com",
                "https://cdn.jsdelivr.net",
                "https://checkout.razorpay.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "data:"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "blob:"
            ],
            connectSrc: [
                "'self'",
                "https://vhdngekmhxldkyvrcblz.supabase.co",
                "https://mrmechkanchi-1.onrender.com",
                "https://api.razorpay.com",
                "https://www.mrkanchi.in",
                "https://mrkanchi.in",
                "http://localhost:*",
                "http://127.0.0.1:*"
            ],
            frameSrc: [
                "'self'",
                "https://api.razorpay.com",
                "https://checkout.razorpay.com"
            ],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"]
        }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false
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
            // Drop keys starting with MongoDB operator indicators ($), containing (.), or prototype pollution keys
            if (key.startsWith("$") || key.includes(".") || key === "__proto__" || key === "constructor" || key === "prototype") {
                delete obj[key];
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
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
