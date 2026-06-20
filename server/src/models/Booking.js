const mongoose = require("mongoose");
const STATUS = require("../constants/status");

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        default: null,
        trim: true,
        index: true // Index high-frequency customer query lookups
    },
    userId: {
        type: String,
        default: null,
        trim: true
    },
    serviceAddress: {
        type: String,
        required: true,
        trim: true
    },
    serviceType: {
        type: String,
        required: true,
        trim: true
    },
    problemDescription: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        default: STATUS.PENDING,
        enum: Object.values(STATUS) // Restrict values to allowed states
    },
    assignedMechanicId: {
        type: String,
        default: null,
        trim: true,
        index: true // Index mechanic ticket assignments query lookups
    },
    mechanicName: {
        type: String,
        default: null,
        trim: true
    },
    acceptedBy: {
        type: String,
        default: null,
        trim: true
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
        default: Date.now,
        index: true // Index sort orders
    },
    vehicleName: {
        type: String,
        default: "",
        trim: true
    },
    vehicleNumber: {
        type: String,
        default: "",
        trim: true
    },
    updatedAt: {
        type: Date,
        default: null
    },
    modifiedByAdminId: {
        type: String,
        default: null,
        trim: true
    },
    modifiedByAdminName: {
        type: String,
        default: null,
        trim: true
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
