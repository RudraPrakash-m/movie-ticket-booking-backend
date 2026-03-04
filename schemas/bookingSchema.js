const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },

    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
    },

    seats: [String],

    amount: Number,

    paymentIntentId: String,
  },
  { timestamps: true },
);

module.exports = bookingSchema;
