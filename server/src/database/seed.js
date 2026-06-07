const bcrypt = require("bcrypt");
const { Admin, User } = require("../models");
const logger = require("../utils/logger");

const seedDatabase = async () => {
    try {
        logger.info("🌱 Database Seeding: Starting seed process...");

        // 1. Seed Master Admin
        const hashedAdminPassword = await bcrypt.hash("Aishu@123", 10);
        await Admin.findOneAndUpdate(
            { phone: "9566721519" },
            {
                name: "AGS Master Admin",
                password: hashedAdminPassword
            },
            { upsert: true, new: true }
        );
        logger.info("✅ Admin Seeded: Phone: 9566721519 | Pass: Aishu@123");

        // 2. Seed Original Mechanic (compatibility with existing DB filter phone)
        const hashedOriginalMechPassword = await bcrypt.hash("ganesh@123", 10);
        await User.findOneAndUpdate(
            { phone: "9566721519" },
            {
                name: "Test Mechanic",
                mechanicType: "tailor machine",
                password: hashedOriginalMechPassword
            },
            { upsert: true, new: true }
        );
        logger.info("✅ Mechanic Seeded (DB default): Phone: 9566721519 | Pass: ganesh@123");

        // 3. Seed Logged Test Mechanic (matching prints from original code)
        const hashedLoggedMechPassword = await bcrypt.hash("mech123", 10);
        await User.findOneAndUpdate(
            { phone: "8888888888" },
            {
                name: "Logged Test Mechanic",
                mechanicType: "tailor machine",
                password: hashedLoggedMechPassword
            },
            { upsert: true, new: true }
        );
        logger.info("✅ Mechanic Seeded (Log default): Phone: 8888888888 | Pass: mech123");

        logger.info("🌱 Database Seeding: Completed successfully.");
    } catch (error) {
        logger.error(`❌ Database Seeding Failed: ${error.message}`);
    }
};

module.exports = seedDatabase;
