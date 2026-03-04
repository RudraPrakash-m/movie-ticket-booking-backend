const { default: mongoose } = require("mongoose");
const bookingSchema = require("../schemas/bookingSchema");

const BOOKING_MODEL = mongoose.model("booking", bookingSchema);

module.exports = BOOKING_MODEL