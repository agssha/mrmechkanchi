const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors({ origin: "*" }));
app.use(express.json());

// =====================================================
// ROUTES
// =====================================================
const masterRoutes = require("./routes/routes");
app.use("/api", masterRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/", (req, res) => {
    res.json({
        message: "Mechanic Service Backend API is running 🚀"
    });
});

// =====================================================
// MONGODB CONNECTION (SAFE VERSION)
// =====================================================
const MONGO_URL =
"mongodb+srv://mrmechkanchi_db_user:Ganesh2004@cluster0.enofrz3.mongodb.net/mrmech?retryWrites=true&w=majority&appName=Cluster0";

async function startServer() {
    try {
        await mongoose.connect(MONGO_URL);

        console.log("✅ MongoDB Connected Successfully");

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("==================================================");
            console.log("🚀 Server Started Successfully");
            console.log(`📡 http://localhost:${PORT}`);
            console.log("==================================================");
        });

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
}

startServer();

// =====================================================
// 404 HANDLER
// =====================================================
app.use((req, res) => {
    res.status(404).json({
        message: "Requested endpoint path not found."
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
    console.error("Fatal Error:", err);

    res.status(500).json({
        message: "Internal server error"
    });
});