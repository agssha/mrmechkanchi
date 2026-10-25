const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto");

// Load environmental variables from server/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const defaultJwtSecret = "AISHU";
let resolvedJwtSecret = process.env.JWT_SECRET;

if (!resolvedJwtSecret || resolvedJwtSecret === defaultJwtSecret) {
    if ((process.env.NODE_ENV || "development") === "production") {
        // Generate a cryptographically secure random 256-bit secret so the server boots safely without token forgery risk
        resolvedJwtSecret = crypto.randomBytes(32).toString("hex");
        console.warn("⚠️ SECURITY WARNING: 'JWT_SECRET' was not set or was using default fallback in production. A cryptographically secure 256-bit random secret was generated dynamically for this session. To avoid session invalidation across server restarts, please set a persistent 'JWT_SECRET' in your environment settings.");
    } else {
        resolvedJwtSecret = defaultJwtSecret;
    }
}

const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoose: {
        url: process.env.MONGO_URI,
        options: {}
    },
    jwt: {
        secret: resolvedJwtSecret,
        accessExpirationDays: 1
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(",").map(s => s.trim().replace(/\/$/, ""))
            : [
                "https://www.mrkanchi.in",
                "https://mrkanchi.in",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5500",
                "http://127.0.0.1:5500"
            ]
    }
};

// Validate critical parameters
if (!config.mongoose.url) {
    throw new Error("❌ CRITICAL CONFIG ERROR: 'MONGO_URI' must be defined in the .env configuration file.");
}

module.exports = config;


