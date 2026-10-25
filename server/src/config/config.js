const dotenv = require("dotenv");
const path = require("path");

// Load environmental variables from server/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const defaultJwtSecret = "AISHU";
const isProduction = (process.env.NODE_ENV || "development") === "production";

const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoose: {
        url: process.env.MONGO_URI,
        options: {}
    },
    jwt: {
        secret: process.env.JWT_SECRET || defaultJwtSecret,
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

// In production, refuse to start with insecure default JWT secret
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === defaultJwtSecret)) {
    throw new Error("❌ CRITICAL SECURITY ERROR: In production, 'JWT_SECRET' must be set to a cryptographically strong secret in the environment variables.");
}

module.exports = config;

