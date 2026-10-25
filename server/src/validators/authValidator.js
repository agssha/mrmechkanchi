const AppError = require("../utils/appError");

class AuthValidator {
    static validateRegister(req, res, next) {
        const { name, phone, password, email } = req.body;
        if (!name || !phone || !password || !email) {
            return next(new AppError("All fields required (name, email, phone, password)", 400));
        }
        if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
            return next(new AppError("Name must be between 2 and 100 characters", 400));
        }
        const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
        if (typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
            return next(new AppError("Phone number must be a valid 10-15 digit number", 400));
        }
        if (typeof password !== "string" || password.length < 8) {
            return next(new AppError("Password must be at least 8 characters long", 400));
        }
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return next(new AppError("Please provide a valid email address", 400));
        }
        next();
    }

    static validateMechanicRegister(req, res, next) {
        const { name, phone, password, mechanicType } = req.body;
        if (!name || !phone || !password || !mechanicType) {
            return next(new AppError("All fields required (name, phone, password, mechanicType)", 400));
        }
        if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
            return next(new AppError("Name must be between 2 and 100 characters", 400));
        }
        const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
        if (typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
            return next(new AppError("Phone number must be a valid 10-15 digit number", 400));
        }
        if (typeof password !== "string" || password.length < 6) {
            return next(new AppError("Password must be at least 6 characters long", 400));
        }
        next();
    }

    static validateLogin(req, res, next) {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return next(new AppError("All fields required (phone, password)", 400));
        }
        if (typeof phone !== "string" || phone.trim().length < 5 || phone.trim().length > 20) {
            return next(new AppError("Invalid login credentials format", 400));
        }
        if (typeof password !== "string" || password.length < 1 || password.length > 256) {
            return next(new AppError("Invalid login credentials format", 400));
        }
        next();
    }

    static validateResetPassword(req, res, next) {
        const { mechanicPhone, newPassword } = req.body;
        if (!mechanicPhone || !newPassword) {
            return next(new AppError("Missing required inputs (mechanicPhone, newPassword)", 400));
        }
        const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
        if (typeof mechanicPhone !== "string" || !phoneRegex.test(mechanicPhone.trim())) {
            return next(new AppError("Invalid mechanic phone number format", 400));
        }
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return next(new AppError("New password must be at least 6 characters long", 400));
        }
        next();
    }
}

module.exports = AuthValidator;

