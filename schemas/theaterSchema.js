const { default: mongoose } = require("mongoose");

const theaterSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    rows: {
      type: [String],
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = theaterSchema;
