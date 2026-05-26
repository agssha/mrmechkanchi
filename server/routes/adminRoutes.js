    // const express = require("express");
    // const router = express.Router();

    // // controllers
    // const {
    //     adminRegister,
    //     adminLogin,
    //     getAllBookings,
    //     assignBooking,
    //     setPrice,
    //     getMechanics
    // } = require("../controllers/bookingController");

    // // ================= MIDDLEWARE (ADMIN ONLY) =================
    // const jwt = require("jsonwebtoken");

    // const JWT_SECRET = "supersecretkey";

    // const adminAuth = (req, res, next) => {
    //     try {
    //         const token = req.headers.authorization?.split(" ")[1];

    //         if (!token) {
    //             return res.status(401).json({ message: "No token provided" });
    //         }

    //         const decoded = jwt.verify(token, JWT_SECRET);

    //         if (decoded.role !== "admin") {
    //             return res.status(403).json({ message: "Admin only access" });
    //         }

    //         req.admin = decoded;
    //         next();

    //     } catch (err) {
    //         return res.status(401).json({ message: "Invalid token" });
    //     }
    // };

    // // ================= AUTH ROUTES =================
    // router.post("/register", adminRegister);
    // router.post("/login", adminLogin);

    // // ================= ADMIN DASHBOARD ROUTES =================
    // router.get("/bookings", adminAuth, getAllBookings);

    // router.post("/assign-booking", adminAuth, assignBooking);

    // router.get("/mechanics", adminAuth, getMechanics);
    // router.put("/set-price", adminAuth, setPrice);

    // module.exports = router;