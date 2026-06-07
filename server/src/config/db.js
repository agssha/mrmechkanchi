const mongoose = require("mongoose");
const config = require("./config");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            logger.info("✅ Database Connection: Successfully connected to MongoDB Atlas cluster.");
        });

        mongoose.connection.on("error", (err) => {
            logger.error(`❌ Database Connection Error: ${err.message}`);
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("⚠️ Database Connection: Disconnected from MongoDB Atlas.");
        });

        // Connect using configuration parameters
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
    } catch (error) {
        logger.error(`❌ Mongoose Connection Boot Exception: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
