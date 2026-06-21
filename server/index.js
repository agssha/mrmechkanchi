const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);


if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
const app = require("./src/app");
const config = require("./src/config/config");
const connectDB = require("./src/config/db");
const seedDatabase = require("./src/database/seed");
const logger = require("./src/utils/logger");
const schedulerService = require("./src/services/schedulerService");

async function bootstrap() {
    try {
        // 1. Establish Secure MongoDB Connection
        await connectDB();

        // 2. Perform Database Seeding (Admin & Mechanics profiles setup)
        await seedDatabase();

        // 3. Start Auto-Cleanup Scheduler Service
        schedulerService.start();

        // 4. Start Port Listener
        const PORT = config.port;
        const server = app.listen(PORT, () => {
            logger.info("==================================================");
            logger.info("🚀 Startup-Grade Server Started Successfully");
            logger.info(`📡 Local Feed: http://localhost:${PORT}`);
            logger.info(`⚙️  Environment Profile: ${config.env}`);
            logger.info("==================================================");
        });

        // Handle process terminations cleanly
        const shutdown = () => {
            logger.warn("Received termination signal. Shutting down server gracefully...");
            schedulerService.stop();
            server.close(() => {
                logger.info("Express server closed.");
                process.exit(0);
            });
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

    } catch (err) {
        logger.error(`❌ Bootstrap Critical Exception: ${err.message}`);
        process.exit(1);
    }
}

bootstrap();