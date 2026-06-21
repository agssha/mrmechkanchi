const Booking = require("../models/Booking");
const bookingService = require("./bookingService");
const logger = require("../utils/logger");

class SchedulerService {
    constructor() {
        this.cleanupIntervalId = null;
    }

    /**
     * Start scheduled background tasks
     */
    start() {
        logger.info("⏰ Scheduler Service: Starting background workers...");
        
        // Run cleanup job immediately on bootstrap
        this.cleanupOldCompletedBookings();

        // Run cleanup job every 24 hours
        const ONEDAY_MS = 24 * 60 * 60 * 1000;
        this.cleanupIntervalId = setInterval(() => {
            this.cleanupOldCompletedBookings();
        }, ONEDAY_MS);
    }

    /**
     * Stop scheduled background tasks cleanly
     */
    stop() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
            logger.info("⏰ Scheduler Service: Stopped background workers.");
        }
    }

    /**
     * Cleanup completed bookings older than 7 days and trigger notifications
     */
    async cleanupOldCompletedBookings() {
        logger.info("🧹 Scheduler Service: Checking for completed bookings older than 7 days...");
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            // Query for bookings that are completed and whose updatedAt (or createdAt if updatedAt is null) is older than 7 days
            const oldBookings = await Booking.find({
                status: "completed",
                $or: [
                    { updatedAt: { $lt: sevenDaysAgo } },
                    { updatedAt: null, createdAt: { $lt: sevenDaysAgo } }
                ]
            });

            if (oldBookings.length === 0) {
                logger.info("🧹 Scheduler Service: No expired completed bookings found.");
                return;
            }

            logger.info(`🧹 Scheduler Service: Found ${oldBookings.length} completed bookings older than 7 days to delete.`);
            
            const systemAdmin = {
                phone: "SYSTEM",
                name: "System Auto-Cleanup"
            };

            for (const booking of oldBookings) {
                try {
                    await bookingService.deleteBooking(booking._id, systemAdmin);
                    logger.info(`✅ Scheduler Service: Automatically deleted and audit-emailed completed booking ID: ${booking._id}`);
                } catch (bookingErr) {
                    logger.error(`❌ Scheduler Service: Failed to auto-delete booking ID ${booking._id}: ${bookingErr.message}`);
                }
            }
        } catch (err) {
            logger.error(`❌ Scheduler Service Exception during cleanup: ${err.message}`);
        }
    }
}

module.exports = new SchedulerService();
