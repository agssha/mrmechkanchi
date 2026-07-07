const mongoose = require("mongoose");

const couponUsageSchema = new mongoose.Schema({
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        required: true,
        index: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    serviceChargeBeforeDiscount: {
        type: Number,
        required: true
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema);

module.exports = CouponUsage;
