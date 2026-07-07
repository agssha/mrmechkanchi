const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
    referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true
    },
    referredId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        unique: true, // A customer can only be referred once
        index: true
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Rejected"],
        default: "Pending"
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    },
    serviceCharge: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date,
        default: null
    },
    adminActionBy: {
        type: String, // admin phone number who acted on it
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
