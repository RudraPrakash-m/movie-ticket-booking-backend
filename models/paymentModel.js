const { default: mongoose } = require("mongoose");
const paymentSchema = require("../schemas/paymentSchema");

const PAYMENT_MODEL = mongoose.model("payments", paymentSchema)

module.exports = PAYMENT_MODEL