const { default: mongoose } = require("mongoose");
const theaterSchema = require("../schemas/theaterSchema");

const THEATER_MODEL = mongoose.model("theaterlayout",theaterSchema)

module.exports = THEATER_MODEL