const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true,
        index: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    referralCountTrigger: {
        type: Number,
        default: 3
    },
    couponType: {
        type: String,
        default: "REFERRAL_REWARD"
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
