const mongoose = require("mongoose");

// ---------------- SHOW SUB-SCHEMA ----------------
const showSchema = new mongoose.Schema(
  {
    date: {
      type: String, // keeping string because frontend uses "2026-03-01"
      required: true,
    },

    time: {
      type: String, // "10:00"
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    bookedSeats: {
      type: [String],
      default: [],
    },

    tempSelectedSeats: {
      type: [String],
      default: [],
    },

    screenId: {
      type: Number,
      required: true,
    },
  },
  { _id: true }, // keep _id so you can target specific shows
);

// ---------------- MOVIE SCHEMA ----------------
const movieSchema = new mongoose.Schema(
  {
    // Since your frontend already uses numeric id
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    addedAt: {
      type: String, // keeping string to match frontend
      required: true,
    },

    releaseDate: {
      type: String, // optional because not all movies have it
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
    },

    duration: {
      type: String,
      required: true,
    },

    genres: {
      type: [String],
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    // Optional because only some movies have it
    // price: {
    //   type: Number,
    //   min: 0,
    // },

    status: {
      type: String,
      enum: ["released", "upcoming"],
      required: true,
    },

    poster: {
      type: String,
      required: true,
    },

    trailer: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    cast: {
      type: [String],
      required: true,
    },

    shows: {
      type: [showSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = movieSchema;
