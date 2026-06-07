const AppError = require("../utils/appError");

class AuthValidator {
    static validateRegister(req, res, next) {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password) {
            return next(new AppError("All fields required (name, phone, password)", 400));
        }
        if (phone.trim().length < 10) {
            return next(new AppError("Phone number must be at least 10 digits long", 400));
        }
        next();
    }

    static validateMechanicRegister(req, res, next) {
        const { name, phone, password, mechanicType } = req.body;
        if (!name || !phone || !password || !mechanicType) {
            return next(new AppError("All fields required (name, phone, password, mechanicType)", 400));
        }
        if (phone.trim().length < 10) {
            return next(new AppError("Phone number must be at least 10 digits long", 400));
        }
        next();
    }

    static validateLogin(req, res, next) {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return next(new AppError("All fields required (phone, password)", 400));
        }
        next();
    }

    static validateResetPassword(req, res, next) {
        const { mechanicPhone, newPassword } = req.body;
        if (!mechanicPhone || !newPassword) {
            return next(new AppError("Missing required inputs (mechanicPhone, newPassword)", 400));
        }
        next();
    }
}

module.exports = AuthValidator;
