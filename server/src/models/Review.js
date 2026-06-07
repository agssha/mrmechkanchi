const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        default: null,
        trim: true
    },
    mechanicName: {
        type: String,
        default: "Not Assigned",
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
