const { Admin, TemporaryPermission } = require("../models");
const { logActivity } = require("./activityLogger");

/**
 * Middleware to check if an admin has a specific permission.
 * If the admin is a SUPER_ADMIN, access is automatically granted.
 * @param {string} permissionName - The permission required (e.g., 'bookingEdit', 'bookingDelete', 'reviewAccess').
 */
const checkPermission = (permissionName) => async (req, res, next) => {
    try {
        if (!req.user || !req.user.phone) {
            return res.status(401).json({ message: "Access Denied: Admin is not authenticated." });
        }

        const admin = await Admin.findOne({ phone: req.user.phone });
        if (!admin) {
            return res.status(404).json({ message: "Access Denied: Admin profile not found." });
        }

        // 1. SUPER_ADMIN gets unrestricted access
        const isSuperAdmin = admin.role === "SUPER_ADMIN" || admin.role === "super_admin";
        if (isSuperAdmin) {
            return next();
        }

        // 2. Check permanent permission
        if (admin.permissions && admin.permissions[permissionName] === true) {
            return next();
        }

        // 3. Check temporary permission
        const tempPermission = await TemporaryPermission.findOne({
            adminId: admin._id,
            permission: permissionName,
            expiresAt: { $gt: new Date() }
        });

        if (tempPermission) {
            // Log that temporary permission was used
            await logActivity(
                admin.phone,
                "Permission Usage",
                `Admin used temporary permission: ${permissionName}`
            );
            return next();
        }

        // Access denied
        return res.status(403).json({
            message: `Access Denied: You do not have the required permission (${permissionName}).`
        });
    } catch (error) {
        return res.status(500).json({ message: `Internal server authorization error: ${error.message}` });
    }
};

module.exports = { checkPermission };