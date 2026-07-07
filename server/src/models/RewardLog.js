const mongoose = require("mongoose");

const rewardLogSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["REFERRAL_COMPLETED", "COUPON_GENERATED", "COUPON_EXPIRED"],
        required: true
    },
    details: {
        type: String,
        required: true
    },
    pointsOrValue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const RewardLog = mongoose.model("RewardLog", rewardLogSchema);

module.exports = RewardLog;
