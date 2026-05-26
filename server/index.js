const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Optional: Loads environment variables from a .env file
const path = require("path");
const app = express();


const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mechanic_db";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// UPDATED: Added a specific database name ('mechanic_db') to the connection string
// mongoose.connect("mongodb://localhost:27017/mechanic_db")
//     .then(() => console.log("✅ MongoDB Connected Successfully"))
//     .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// =========================================================================
// 1. GLOBAL MIDDLEWARE SETUP
// =========================================================================
// Enables Cross-Origin Resource Sharing (CORS) for all origins so your frontend can connect
app.use(cors({
    origin: "*"
}));

// Crucial body parsing middleware to read incoming JSON data in req.body
app.use(express.json());

// =========================================================================
// 2. HEALTH CHECK ROUTE
// =========================================================================
app.get("/", (req, res) => {
    res.json({ message: "Mechanic Service Backend API is up and running 🚀" });
});

// =========================================================================
// 3. UNIFIED ROUTE MOUNTING
// =========================================================================
// Mounts all public and secured role-based paths from your route.js file
const masterRoutes = require("./routes/routes"); 
app.use("/api", masterRoutes);

// =========================================================================
// 4. INVALID ENDPOINT (404) HANDLER
// =========================================================================
// Catches requests to URLs that do not exist
app.use((req, res) => {
    res.status(404).json({ message: "Requested endpoint path not found." });
});

// =========================================================================
// 5. GLOBAL EXCEPTION ERROR HANDLER
// =========================================================================
// Prevents the server from crashing due to runtime syntax or operational logic breaks
app.use((err, req, res, next) => {
    console.error("Fatal Error Triggered:", err.stack);
    res.status(500).json({ 
        message: "Internal server error encountered.",
        error: process.env.NODE_ENV === "development" ? err.message : {} // Only shows stack details in development mode
    });
});

// =========================================================================
// 6. SERVER INITIATION LISTENER
// =========================================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Secure Server initializing dynamically...`);
    console.log(`📡 Listening at: http://localhost:${PORT}`);
    console.log(`==================================================`);
});