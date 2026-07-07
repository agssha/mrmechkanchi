const { Booking, TemporaryPermission, Coupon, RewardLog } = require("../models");
const bookingService = require("./bookingService");
const emailService = require("./emailService");
const logger = require("../utils/logger");

class SchedulerService {
    constructor() {
        this.cleanupIntervalId = null;
        this.tempPermissionIntervalId = null;
    }

    /**
     * Start scheduled background tasks
     */
    start() {
        logger.info("⏰ Scheduler Service: Starting background workers...");
        
        // Run cleanup jobs immediately on bootstrap
        this.cleanupOldCompletedBookings();
        this.cleanupExpiredTemporaryPermissions();
        this.checkAndNotifyCouponExpirations();

        // Run cleanup and expiration checks every 24 hours
        const ONEDAY_MS = 24 * 60 * 60 * 1000;
        this.cleanupIntervalId = setInterval(() => {
            this.cleanupOldCompletedBookings();
            this.checkAndNotifyCouponExpirations();
        }, ONEDAY_MS);

        // Run temporary permissions cleanup every 1 minute
        const ONE_MINUTE_MS = 60 * 1000;
        this.tempPermissionIntervalId = setInterval(() => {
            this.cleanupExpiredTemporaryPermissions();
        }, ONE_MINUTE_MS);
    }

    /**
     * Stop scheduled background tasks cleanly
     */
    stop() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }
        if (this.tempPermissionIntervalId) {
            clearInterval(this.tempPermissionIntervalId);
            this.tempPermissionIntervalId = null;
        }
        logger.info("⏰ Scheduler Service: Stopped background workers.");
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

    /**
     * Cleanup expired temporary permissions
     */
    async cleanupExpiredTemporaryPermissions() {
        try {
            const now = new Date();
            const result = await TemporaryPermission.deleteMany({ expiresAt: { $lte: now } });
            if (result.deletedCount > 0) {
                logger.info(`🧹 Scheduler Service: Purged ${result.deletedCount} expired TemporaryPermission entries.`);
            }
        } catch (err) {
            logger.error(`❌ Scheduler Service Exception during temporary permissions cleanup: ${err.message}`);
        }
    }

    /**
     * Check for coupons expiring within 7 days and email customer reminders
     */
    async checkAndNotifyCouponExpirations() {
        logger.info("🧹 Scheduler Service: Checking for expiring coupons...");
        try {
            const now = new Date();
            const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // Find coupons expiring in the next 7 days that haven't been used and haven't had a notification sent
            const expiringCoupons = await Coupon.find({
                isUsed: false,
                expiryDate: { $gt: now, $lt: sevenDaysFromNow },
                notificationSent: false
            }).populate("customerId");

            if (expiringCoupons.length === 0) {
                logger.info("🧹 Scheduler Service: No expiring coupons needing notifications.");
                return;
            }

            logger.info(`🧹 Scheduler Service: Found ${expiringCoupons.length} expiring coupons to notify.`);

            for (const coupon of expiringCoupons) {
                const customer = coupon.customerId;
                if (!customer) continue;

                try {
                    const daysRemaining = Math.max(1, Math.round((new Date(coupon.expiryDate) - now) / (24 * 60 * 60 * 1000)));
                    
                    // Send notification email
                    await emailService.sendCouponExpiryReminderEmail(customer.email, customer.name, coupon.code, coupon.expiryDate, daysRemaining);

                    // Mark as sent
                    coupon.notificationSent = true;
                    await coupon.save();

                    // Log reward activity
                    await RewardLog.create({
                        customerId: customer._id,
                        type: "COUPON_EXPIRED", // We can use coupon expired category or custom one
                        details: `Sent expiry reminder email for coupon ${coupon.code}. Expiry in ${daysRemaining} days.`
                    });

                    logger.info(`✅ Scheduler Service: Sent expiry warning to ${customer.email} for coupon ${coupon.code}`);
                } catch (couponErr) {
                    logger.error(`❌ Scheduler Service: Failed to process warning for coupon ${coupon.code}: ${couponErr.message}`);
                }
            }
        } catch (err) {
            logger.error(`❌ Scheduler Service Exception during coupon expiration checks: ${err.message}`);
        }
    }
}

module.exports = new SchedulerService();
