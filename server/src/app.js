const express = require("express");
const path = require("path");
const {
    corsMiddleware,
    helmetMiddleware,
    generalLimiter,
    authLimiter,
    sanitizeMiddleware,
    duplicatePreventer
} = require("./middlewares/securityMiddleware");
const masterRoutes = require("./routes");
const errorHandler = require("./middlewares/errorMiddleware");
const ApiResponse = require("./utils/apiResponse");

const app = express();

// Trust proxy to allow express-rate-limit to read X-Forwarded-For headers behind Render/Nginx
app.set("trust proxy", 1);

// =====================================================
// SECURITY MIDDLEWARES & HEADERS
// =====================================================
app.use(helmetMiddleware);
app.use(corsMiddleware);

// =====================================================
// REQUEST BODY PARSING & SANITIZATION
// =====================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware); // Protect against NoSQL injection
app.use("/api", duplicatePreventer(3000)); // Protect all API endpoints from rapid duplicates

// =====================================================
// SERVE FRONTEND STATIC FILES
// =====================================================
app.use(express.static(path.join(__dirname, "../../frontend")));

// =====================================================
// RATE LIMITERS Configuration
// =====================================================
// Apply strict limiter on logins, registrations, and repair booking routes
app.use("/api/auth", authLimiter);
app.use("/api/customer/book-repair", authLimiter);

// Apply general limiter for all other API endpoints
app.use("/api", generalLimiter);

// =====================================================
// API MASTER ROUTES MOUNT
// =====================================================
app.use("/api", masterRoutes);

// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
app.get("/api/health", (req, res) => {
    return ApiResponse.success(res, "Mechanic Service Backend API is running 🚀", {
        status: "healthy",
        uptime: process.uptime()
    }, 200);
});

// =====================================================
// 404 ENDPOINT PATH HANDLER
// =====================================================
app.use((req, res) => {
    return ApiResponse.error(res, "Requested endpoint path not found.", 404);
});

// =====================================================
// CENTRALIZED ERROR HANDLER MIDDLEWARE
// =====================================================
app.use(errorHandler);

module.exports = app;
