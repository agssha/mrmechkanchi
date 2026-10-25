const bcrypt = require("bcrypt");
const { Admin, User, ReferralConfig } = require("../models");
const logger = require("../utils/logger");


const seedDatabase = async () => {
    try {
        logger.info("🌱 Database Seeding: Checking baseline administrative records...");

        // 1. Seed Master Admin (Super Admin) only if not already present
        const existingSuperAdmin = await Admin.findOne({ 
            $or: [{ phone: "9566721519" }, { role: "SUPER_ADMIN" }] 
        });

        if (!existingSuperAdmin) {
            const initialPassword = process.env.INITIAL_SUPERADMIN_PASSWORD || "Aishu@123";
            const hashedAdminPassword = await bcrypt.hash(initialPassword, 10);
            await Admin.create({
                name: "AGS Master Admin",
                email: "superadmin@mrmech.com",
                phone: "9566721519",
                password: hashedAdminPassword,
                role: "SUPER_ADMIN"
            });
            logger.info("✅ Super Admin Initial Seed Created for phone: 9566721519 [Credentials secured]");
        } else {
            logger.info("ℹ️ Super Admin account exists. Preserving existing credentials.");
        }

        // 2. Seed Standard Admin only if not already present
        const existingAdmin = await Admin.findOne({ phone: "7777777777" });
        if (!existingAdmin) {
            const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
            const hashedStandardAdminPassword = await bcrypt.hash(initialPassword, 10);
            await Admin.create({
                name: "Standard Admin",
                email: "admin@mrmech.com",
                phone: "7777777777",
                password: hashedStandardAdminPassword,
                role: "ADMIN"
            });
            logger.info("✅ Standard Admin Initial Seed Created for phone: 7777777777 [Credentials secured]");
        } else {
            logger.info("ℹ️ Standard Admin account exists. Preserving existing credentials.");
        }

        // 3. Seed Initial Mechanic only if not already present
        const existingOrigMech = await User.findOne({ phone: "9566721519" });
        if (!existingOrigMech) {
            const hashedOriginalMechPassword = await bcrypt.hash("ganesh@123", 10);
            await User.create({
                phone: "9566721519",
                name: "Test Mechanic",
                mechanicType: "tailor machine",
                password: hashedOriginalMechPassword
            });
            logger.info("✅ Test Mechanic profile seeded for phone: 9566721519 [Credentials secured]");
        }

        const existingLoggedMech = await User.findOne({ phone: "8888888888" });
        if (!existingLoggedMech) {
            const hashedLoggedMechPassword = await bcrypt.hash("mech123", 10);
            await User.create({
                phone: "8888888888",
                name: "Logged Test Mechanic",
                mechanicType: "tailor machine",
                password: hashedLoggedMechPassword
            });
            logger.info("✅ Logged Test Mechanic profile seeded for phone: 8888888888 [Credentials secured]");
        }

        // 4. Seed Default Referral Config
        const existingConfig = await ReferralConfig.findOne();
        if (!existingConfig) {
            await ReferralConfig.create({
                referralTarget: 3,
                rewardPercentage: 25,
                couponExpiryDays: 90,
                maxDiscountAmount: 500
            });
            logger.info("✅ Referral Config Seeded: Target: 3 | Reward: 25% | Expiry: 90 days | Max Discount: ₹500");
        } else {
            logger.info("ℹ️ Referral Config already exists. Skipping seeding.");
        }

        logger.info("🌱 Database Seeding: Validation completed successfully.");
    } catch (error) {
        logger.error(`❌ Database Seeding Failed: ${error.message}`);
    }
};

module.exports = seedDatabase;
