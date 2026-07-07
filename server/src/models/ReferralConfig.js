const mongoose = require("mongoose");

const referralConfigSchema = new mongoose.Schema({
    referralTarget: {
        type: Number,
        default: 3
    },
    rewardPercentage: {
        type: Number,
        default: 25
    },
    couponExpiryDays: {
        type: Number,
        default: 90
    },
    maxDiscountAmount: {
        type: Number,
        default: 500
    }
}, {
    timestamps: true
});

const ReferralConfig = mongoose.model("ReferralConfig", referralConfigSchema);

module.exports = ReferralConfig;
