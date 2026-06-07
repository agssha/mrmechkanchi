const dotenv = require("dotenv");
const path = require("path");

// Load environmental variables from server/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoose: {
        url: process.env.MONGO_URI,
        options: {}
    },
    jwt: {
        secret: process.env.JWT_SECRET || "AISHU",
        accessExpirationDays: 1
    }
};

// Validate critical parameters
if (!config.mongoose.url) {
    throw new Error("❌ CRITICAL CONFIG ERROR: 'MONGO_URI' must be defined in the .env configuration file.");
}

module.exports = config;
