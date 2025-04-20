const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
    bid: {
        type: Number,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Auction', AuctionSchema);