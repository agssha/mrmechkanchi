const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin, User, TemporaryPermission } = require("../models");
const AppError = require("../utils/appError");
const config = require("../config/config");

class AuthService {
    /**
     * Register a new admin account
     */
    async registerAdmin(name, email, phone, password) {
        if (!email) {
            throw new AppError("Email is required for registration", 400);
        }
        const existingAdmin = await Admin.findOne({ $or: [{ phone }, { email }] });
        if (existingAdmin) {
            throw new AppError("Admin with this phone or email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword,
            role: "ADMIN"
        });
        
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

        // Find active temporary permissions
        const tempPermissions = await TemporaryPermission.find({
            adminId: admin._id,
            expiresAt: { $gt: new Date() }
        });

        const permissions = {
            bookingEdit: admin.permissions?.bookingEdit || false,
            bookingDelete: admin.permissions?.bookingDelete || false,
            reviewAccess: admin.permissions?.reviewAccess || false
        };

        tempPermissions.forEach(tp => {
            if (tp.permission && permissions[tp.permission] === false) {
                permissions[tp.permission] = true;
            }
        });

        // Update last login timestamp
        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { 
                phone, 
                role: (admin.role || "ADMIN").toUpperCase(), 
                name: admin.name,
                permissions: permissions
            },
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
