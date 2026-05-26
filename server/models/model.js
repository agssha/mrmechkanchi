const mongoose = require("mongoose");

// ================= USER / MECHANIC MODEL =================
const User = mongoose.model("User", {
    name: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    mechanicType: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }
});


// ================= ADMIN MODEL =================
const Admin = mongoose.model("Admin", {
    name: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});


// ================= BOOKING MODEL =================
const Booking = mongoose.model("Booking", {

    name: {
        type: String,
        required: true
    },

    mobileNumber: {
        type: String,
        required: true
    },

    // ADDED: Google Auth Email for tracking
    userEmail: {
        type: String,
        default: null
    },

    // ADDED: Google Auth User ID
    userId: {
        type: String,
        default: null
    },

    serviceAddress: {
        type: String,
        required: true
    },

    serviceType: {
        type: String,
        required: true
    },

    problemDescription: {
        type: String
    },

    status: {
        type: String,
        default: "pending"
    },

    assignedMechanicId: {
        type: String,
        default: null
    },

    mechanicName: {
        type: String,
        default: null
    },

    acceptedBy: {
        type: String,
        default: null
    },

    estimatedPrice: {
        type: Number,
        default: 0
    },

    paymentMode: {
        type: String,
        default: null
    },

    paymentStatus: {
        type: String,
        default: "Pending"
    },

    razorpayOrderId: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// ================= REVIEW MODEL =================
const Review = mongoose.model("Review", {

    bookingId: {
        type: String,
        required: true
    },

    customerName: {
        type: String,
        required: true
    },

    // ADDED: Google Auth Email
    userEmail: {
        type: String,
        default: null
    },

    mechanicName: {
        type: String
    },

    rating: {
        type: Number,
        required: true
    },

    review: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// ================= EXPORT =================
module.exports = {
    User,
    Admin,
    Booking,
    Review
};