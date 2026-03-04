const express = require("express");
const authMiddleware = require("../../../middlewares/Authentication");
const {
  toggleFavourite,
  createPayment,
  createPaymentIntent,
  holdSeats,
  confirmSeats,
  releaseSeats,
  getMyBookings,
} = require("../controller/privateController");

const privateRouter = express.Router();

// console.log(confirmSeats);

privateRouter.patch("/toggle-favourite", authMiddleware, toggleFavourite);

privateRouter.post("/payment", authMiddleware, createPayment);

privateRouter.post(
  "/payments/create-intent",
  authMiddleware,
  createPaymentIntent,
);

privateRouter.post("/hold-seats", authMiddleware, holdSeats);

privateRouter.post("/confirm-seats", authMiddleware, confirmSeats);

privateRouter.post("/release-seats", authMiddleware, releaseSeats);

privateRouter.get("/my-bookings", authMiddleware, getMyBookings);

module.exports = privateRouter;
