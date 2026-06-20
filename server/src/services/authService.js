const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin, User } = require("../models");
const AppError = require("../utils/appError");
const config = require("../config/config");

class AuthService {
    /**
     * Register a new admin account
     */
    async registerAdmin(name, phone, password) {
        const existingAdmin = await Admin.findOne({ phone });
        if (existingAdmin) {
            throw new AppError("Admin already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({ name, phone, password: hashedPassword });
        
        return { message: "Admin registered successfully" };
    }

    /**
     * Authenticate an admin and issue token
     */
    async loginAdmin(phone, password) {
        const admin = await Admin.findOne({ phone });
        if (!admin) {
            throw new AppError("Admin credentials not found", 400);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new AppError("Invalid credentials", 400);
        }

        const token = jwt.sign(
            { phone, role: admin.role || "admin", name: admin.name },
            config.jwt.secret,
            { expiresIn: "1d" }
        );

        return { message: "Login success", token };
    }

    /**
     * Register a new mechanic account (by Admin)
     */
    async registerMechanic(name, phone, password, mechanicType) {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            throw new AppError("Mechanic profile already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, phone, mechanicType, password: hashedPassword });

        return { message: "Mechanic registered successfully by Admin" };
    }

    /**
     * Authenticate a mechanic and issue token
     */
    async loginMechanic(phone, password) {
        const user = await User.findOne({ phone });
        if (!user) {
            throw new AppError("Mechanic user profile not found", 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Wrong password", 400);
        }

        const token = jwt.sign(
            { phone, role: "mechanic", name: user.name },
            config.jwt.secret,
            { expiresIn: "1d" }
        );

        return {
            message: "Login success",
            token,
            mechanicType: user.mechanicType
        };
    }
}

module.exports = new AuthService();
