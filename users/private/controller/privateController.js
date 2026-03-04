const BOOKING_MODEL = require("../../../models/bookingModel");
const MOVIE_MODEL = require("../../../models/movieModel");
const PAYMENT_MODEL = require("../../../models/paymentModel");
const USER_MODEL = require("../../../models/userModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId);

    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie ID required",
      });
    }

    // Try removing first
    const removed = await USER_MODEL.updateOne(
      { _id: userId, favourites: movieId },
      { $pull: { favourites: movieId } },
    );

    if (removed.modifiedCount > 0) {
      return res.status(200).json({
        success: true,
        action: "removed",
      });
    }

    // If not removed, add it
    await USER_MODEL.updateOne(
      { _id: userId },
      { $addToSet: { favourites: movieId } },
    );

    return res.status(200).json({
      success: true,
      action: "added",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- STRIPE PAYMENT INTENT ----------------
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to paise
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- STORE PAYMENT ----------------
const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId);

    const { amount, paymentIntentId, movieId, showId, seats } = req.body;

    // console.log(amount, paymentIntentId, movieId, showId, seats);

    if (!amount || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Amount and paymentIntentId required",
      });
    }

    const existingPayment = await PAYMENT_MODEL.findOne({
      paymentIntentId,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already stored",
      });
    }

    const user = await USER_MODEL.findById(userId);
    // console.log(user);

    const payment = await PAYMENT_MODEL.create({
      userId: user._id,
      userName: user.name,
      email: user.email,
      amount,
      paymentIntentId,
      status: "success",
    });

    // console.log({
    //   movieId,
    //   showId,
    //   seats,
    //   amount,
    //   paymentIntentId,
    // });

    // CREATE BOOKING
    const booking = await BOOKING_MODEL.create({
      userId,
      movieId,
      showId,
      seats,
      amount,
      paymentIntentId,
    });

    // UPDATE USER
    await USER_MODEL.findByIdAndUpdate(userId, {
      $push: { bookedTickets: booking._id },
    });

    return res.status(201).json({
      success: true,
      message: "Payment and booking stored successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const holdSeats = async (req, res) => {
  // console.log("HOLD SEATS HIT");
  try {
    const { movieId, showId, seats } = req.body;

    // console.log(showId);

    if (!movieId || !showId || !seats?.length) {
      return res.status(400).json({
        success: false,
        message: "movieId, showId and seats required",
      });
    }

    const movie = await MOVIE_MODEL.findOne({ id: movieId });
    // console.log(movie);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const show = movie.shows.find(
      (s) => s._id.toString() === showId.toString(),
    );
    // console.log(show);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // check conflicts
    const seatConflict = seats.some(
      (seat) =>
        show.bookedSeats.includes(seat) ||
        show.tempSelectedSeats.includes(seat),
    );

    if (seatConflict) {
      return res.status(400).json({
        success: false,
        message: "Some seats already taken",
      });
    }

    show.tempSelectedSeats.push(...seats);

    await movie.save();

    res.json({
      success: true,
      message: "Seats temporarily locked",
      seats,
    });
  } catch (error) {
    console.error("HOLD SEATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const confirmSeats = async (req, res) => {
  try {
    const { movieId, showId, seats } = req.body;

    const movie = await MOVIE_MODEL.findOne({ id: movieId });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const show = movie.shows.id(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // move seats from temp → booked
    show.bookedSeats.push(...seats);

    show.tempSelectedSeats = show.tempSelectedSeats.filter(
      (seat) => !seats.includes(seat),
    );

    await movie.save();

    res.json({
      success: true,
      message: "Seats booked successfully",
      bookedSeats: show.bookedSeats,
    });
  } catch (error) {
    console.error("CONFIRM SEATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const releaseSeats = async (req, res) => {
  try {
    const { movieId, showId, seats } = req.body;

    const movie = await MOVIE_MODEL.findOne({ id: movieId });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const show = movie.shows.id(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    show.tempSelectedSeats = show.tempSelectedSeats.filter(
      (seat) => !seats.includes(seat),
    );

    await movie.save();

    res.json({
      success: true,
      message: "Temp seats released",
    });
  } catch (error) {
    console.error("RELEASE SEATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  toggleFavourite,
  createPayment,
  createPaymentIntent,
  holdSeats,
  confirmSeats,
  releaseSeats,
};
