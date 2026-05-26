const { User, Admin, Booking, Review } = require("../models/model"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= SECRET =================
// const JWT_SECRET = process.env.JWT_SECRET || "AISHU";

const secretKey = process.env.JWT_SECRET || "Aishu";
const token = jwt.sign({ id: user._id }, secretKey);

// ================= STATUS CONSTANTS =================
const STATUS = {
    PENDING: "pending",
    ASSIGNED: "assigned",
    ACCEPTED: "accepted",
    PRICE_SET: "price_set",
    COMPLETED: "completed"
};

// ================= FORCE SEED ADMIN & MECHANIC =================
// 1. Force Admin Account
bcrypt.hash("Aishu@123", 10).then(async (hashedAdmin) => {
    try {
        await Admin.findOneAndUpdate(
            { phone: "9566721519" }, 
            { name: "AGS Master Admin", password: hashedAdmin }, 
            { upsert: true } // Creates it if missing, updates it if broken
        );
        console.log("✅ Admin Ready -> Phone: 9566721519 | Pass: admin123");
    } catch (err) {
        console.error("Error seeding admin:", err);
    }
});

// 2. Force Test Mechanic Account
bcrypt.hash("ganesh@123", 10).then(async (hashedMech) => {
    try {
        await User.findOneAndUpdate(
            { phone: "9566721519" }, 
            { name: "Test Mechanic", mechanicType: "tailor machine", password: hashedMech }, 
            { upsert: true }
        );
        console.log("✅ Mechanic Ready -> Phone: 8888888888 | Pass: mech123");
    } catch (err) {
        console.error("Error seeding mechanic:", err);
    }
});

// ================= TOKEN MIDDLEWARE =================
const auth = (role) => (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 

        if (role && decoded.role !== role) {
            return res.status(403).json({ message: "Forbidden: Unauthorized role profile." });
        }

        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired session token." });
    }
};

// ================= ADMIN REGISTER =================
const adminRegister = async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password) return res.status(400).json({ message: "All fields required" });
        
        const existingAdmin = await Admin.findOne({ phone: phone }); 
        if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

        const hashed = await bcrypt.hash(password, 10);
        await Admin.create({ name, phone, password: hashed });
        
        res.json({ message: "Admin registered successfully" });
    } catch(error) {
        console.log(error, "error");
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ================= ADMIN LOGIN =================
const adminLogin = async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        const admin = await Admin.findOne({ phone: phone });
        if (!admin) return res.status(400).json({ message: "Admin credentials not found" });

        const match = await bcrypt.compare(password, admin.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { phone, role: "admin", name: admin.name },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ message: "Login success", token });
    } catch (error) {
        console.log(error, "error");
        res.status(500).json({ message: "Server error" });
    }
};

// ================= MECHANIC REGISTER =================
const register = async (req, res) => {
    try {
        const { name, phone, password, mechanicType } = req.body;
        if (!name || !phone || !password || !mechanicType) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ phone: phone });
        if (existingUser) return res.status(400).json({ message: "Mechanic profile already exists" });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, phone, mechanicType, password: hashed });
        
        res.json({ message: "Mechanic registered successfully by Admin" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ================= ADMIN RESET MECHANIC PASSWORD =================
const adminResetMechanicPassword = async (req, res) => {
    try {
        const { mechanicPhone, newPassword } = req.body;
        if (!mechanicPhone || !newPassword) return res.status(400).json({ message: "Missing required inputs" });

        const mechanic = await User.findOne({ phone: mechanicPhone });
        if (!mechanic) return res.status(404).json({ message: "Mechanic not found" });

        mechanic.password = await bcrypt.hash(newPassword, 10);
        await mechanic.save();
        
        res.json({ message: `Password updated successfully for mechanic: ${mechanic.name}` });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= MECHANIC LOGIN =================
const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        const user = await User.findOne({ phone: phone });
        if (!user) return res.status(400).json({ message: "Mechanic user profile not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Wrong password" });

        const token = jwt.sign(
            { phone, role: "mechanic", name: user.name },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ message: "Login success", token, mechanicType: user.mechanicType });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= CREATE BOOKING =================
const createBooking = async (req, res) => {
    try {
        const { name, mobileNumber, userEmail, userId, serviceAddress, serviceType, problemDescription } = req.body;
        
        if (!name || !mobileNumber || !serviceAddress || !serviceType) {
            return res.status(400).json({ message: "All fields required" });
        }

        const newBooking = await Booking.create({
            name,
            mobileNumber,
            userEmail, 
            userId,    
            serviceAddress,
            serviceType,
            problemDescription,
            status: STATUS.PENDING,
            createdAt: new Date()
        });

        res.json({ message: "Booking generated successfully", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET ALL BOOKINGS =================
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= ASSIGN BOOKING =================
const assignBooking = async (req, res) => {
    try {
        const { bookingId, mechanicName, mechanicPhone } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.mechanicName = mechanicName;
        booking.assignedMechanicId = mechanicPhone;
        booking.status = STATUS.ASSIGNED;
        
        await booking.save();
        res.json({ message: "Mechanic assigned successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= ACCEPT JOB =================
const acceptJob = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const mechanicPhone = req.user.phone; 

        if (!bookingId) {
            return res.status(400).json({ message: "Missing bookingId in request body." });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== STATUS.ASSIGNED) {
            return res.status(400).json({ message: "Job state is no longer open for assignment updates." });
        }

        if (booking.assignedMechanicId !== mechanicPhone) {
            return res.status(403).json({ message: "Access Denied: Job profile mismatch." });
        }

        booking.status = STATUS.ACCEPTED;
        booking.acceptedBy = mechanicPhone;
        
        await booking.save();
        res.json({ message: "Job status confirmed as accepted", booking });
    } catch (error) {
        console.error("Error in acceptJob:", error); 
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ================= SET PRICE =================
const setPrice = async (req, res) => {
    try {
        const { bookingId, price } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking reference missing" });
        
        if (booking.acceptedBy !== req.user.phone) {
            return res.status(403).json({ message: "Unauthorized access verification failed." });
        }

        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) return res.status(400).json({ message: "Invalid pricing amount configuration" });

        booking.estimatedPrice = numPrice;
        booking.status = STATUS.PRICE_SET;
        
        await booking.save();
        res.json({ message: "Service charge saved successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= CONFIRM CASH COLLECTION =================
const recordCashPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking record validation error" });
        if (booking.acceptedBy !== req.user.phone) return res.status(403).json({ message: "Action unauthorized" });

        booking.paymentMode = "Cash";
        booking.paymentStatus = "Paid";
        booking.status = STATUS.COMPLETED;
        
        await booking.save();
        res.json({ message: "Cash collection confirmation registered across panels", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= PROCESS ONLINE PAYMENT =================
const recordOnlinePayment = async (req, res) => {
    try {
        const { bookingId, razorpayOrderId } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking reference verified invalid" });

        booking.paymentMode = "Online";
        booking.paymentStatus = "Paid";
        booking.razorpayOrderId = razorpayOrderId;
        booking.status = STATUS.COMPLETED;
        
        await booking.save();
        res.json({ message: "Online payment gateway verification logged successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= TRACK BOOKING =================
const trackBooking = async (req, res) => {
    try {
        const email = req.params.email; 
        const data = await Booking.find({ userEmail: email }); 

        const safeData = data.map(b => {
            const canSeeNumber = b.status === STATUS.ACCEPTED || b.status === STATUS.PRICE_SET || b.status === STATUS.COMPLETED;
            const bookingObj = b.toObject(); 
            bookingObj.mobileNumber = canSeeNumber ? b.mobileNumber : "********";
            return bookingObj;
        });

        res.json({ bookings: safeData });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET MECHANIC SPECIFIC JOBS =================
const getMechanicBookings = async (req, res) => {
    try {
        const mechanicPhone = req.params.mechanicPhone;

        if (req.user.role !== "admin" && req.user.phone !== mechanicPhone) {
            return res.status(403).json({ message: "Access Denied: Identification match verification failed." });
        }

        const data = await Booking.find({ assignedMechanicId: mechanicPhone });

        const safeData = data.map(b => {
            const activeJob = b.status === STATUS.ACCEPTED || b.status === STATUS.PRICE_SET || b.status === STATUS.COMPLETED;
            const bookingObj = b.toObject();
            bookingObj.mobileNumber = activeJob ? b.mobileNumber : "Hidden until Job Accepted";
            return bookingObj;
        });

        res.json({ bookings: safeData });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= ADD REVIEW =================
const addReview = async (req, res) => {
    try {
        const { bookingId, customerName, userEmail, mechanicName, rating, review } = req.body;

        if (!bookingId || !customerName || !rating || !review) {
            return res.status(400).json({ message: "All required tracking variables must be present" });
        }
        if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating context scale constraints: 1-5" });

        const newReview = await Review.create({
            bookingId,
            customerName,
            userEmail,
            mechanicName: mechanicName || "Not Assigned", 
            rating,
            review,
            createdAt: new Date()
        });

        res.json({ message: "Thank you for submitting feedback details!", review: newReview });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET ALL REVIEWS =================
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= MASTER STATUS CONTROL =================
const updateStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            bookingId, 
            { status }, 
            { new: true }
        );

        if (!booking) return res.status(404).json({ message: "Booking entry error" });

        res.json({ message: "Workflow state modified directly", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET ALL ACTIVE MECHANICS LIST =================
const getMechanics = async (req, res) => {
    try {
        const mechanics = await User.find({}, 'name phone mechanicType');
        res.json({ mechanics });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ================= EXPORTS =================
module.exports = {
    auth, 
    register,
    login,
    adminRegister,
    adminLogin,
    adminResetMechanicPassword,
    createBooking,
    getAllBookings,
    assignBooking,
    acceptJob,
    setPrice,
    recordCashPayment,
    recordOnlinePayment,
    trackBooking,
    addReview,
    getReviews,
    getMechanicBookings,
    updateStatus,
    getMechanics
};