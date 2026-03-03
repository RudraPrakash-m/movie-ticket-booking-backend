const { default: mongoose } = require("mongoose");
const movieSchema = require("../schemas/movieSchema");

const MOVIE_MODEL = mongoose.model("movie",movieSchema)

module.exports = MOVIE_MODEL