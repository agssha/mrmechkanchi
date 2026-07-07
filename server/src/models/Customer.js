const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    referredByCode: {
        type: String,
        default: null
    },
    referredByCustomer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
    },
    ipAddresses: [{
        type: String
    }],
    userAgentFingerprints: [{
        type: String
    }]
}, {
    timestamps: true
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
