const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");
const { logActivity } = require("../middlewares/activityLogger");
const { Admin, TemporaryPermission } = require("../models");

class AuthController {
    /**
     * Admin register endpoint
     */
    async adminRegister(req, res, next) {
        try {
            const { name, email, phone, password } = req.body;
            const result = await authService.registerAdmin(name, email, phone, password);
            return ApiResponse.success(res, result.message, {}, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin login endpoint
     */
    async adminLogin(req, res, next) {
        try {
            const { phone, password } = req.body;
            const result = await authService.loginAdmin(phone, password);
            return ApiResponse.success(res, result.message, { token: result.token }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin profile endpoint
     */
    async adminProfile(req, res, next) {
        try {
            const admin = await Admin.findOne({ phone: req.user.phone }).select("-password");
            if (!admin) {
                return res.status(404).json({ message: "Admin profile not found." });
            }

            // Find active temporary permissions
            const tempPermissions = await TemporaryPermission.find({
                adminId: admin._id,
                expiresAt: { $gt: new Date() }
            });

            // Build the dynamic permissions object combining permanent & active temporary ones
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

            return res.json({
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone,
                    role: admin.role,
                    permissions: permissions
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin logout endpoint
     */
    async adminLogout(req, res, next) {
        try {
            await logActivity(req.user.phone, "Logout", "Admin logged out");
            return ApiResponse.success(res, "Logout successful", {}, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic register endpoint (by Admin)
     */
    async registerMechanic(req, res, next) {
        try {
            const { name, phone, password, mechanicType } = req.body;
            const result = await authService.registerMechanic(name, phone, password, mechanicType);
            return ApiResponse.success(res, result.message, {}, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic login endpoint
     */
    async loginMechanic(req, res, next) {
        try {
            const { phone, password } = req.body;
            const result = await authService.loginMechanic(phone, password);
            return ApiResponse.success(res, result.message, {
                token: result.token,
                mechanicType: result.mechanicType
            }, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();

