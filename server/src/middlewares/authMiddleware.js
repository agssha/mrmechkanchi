const jwt = require("jsonwebtoken");
const config = require("../config/config");

const auth = (role) => (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && typeof authHeader === "string") {
            token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
        }

        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;

        if (role) {
            const rolesArray = (Array.isArray(role) ? role : [role]).map(r => r.toUpperCase());
            const userRole = (decoded.role || "").toUpperCase();
            if (!rolesArray.includes(userRole)) {
                return res.status(403).json({ message: "Forbidden: Unauthorized role profile." });
            }
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired session token." });
    }

};

module.exports = auth;
