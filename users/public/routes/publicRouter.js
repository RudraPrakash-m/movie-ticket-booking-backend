const express = require("express");
const {
  publicPage,
  register,
  login,
  me,
  logout,
  verifyOtp,
  allMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  addShow,
  theaterLayout,
  createTheater,
  updateTheater,
} = require("../controller/publicController");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../../../middlewares/Authentication");
const isAdmin = require("../../../middlewares/isAdmin");

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const publicRouter = express.Router();

publicRouter.get("/public", publicPage);

publicRouter.post("/register", registerLimiter, register);

publicRouter.post("/login", login);

publicRouter.get("/me", authMiddleware, me);

publicRouter.post("/logout", authMiddleware, logout);

publicRouter.post("/verify-otp", verifyOtp);

publicRouter.get("/all-movies", allMovies);

publicRouter.post("/add-movie", authMiddleware, isAdmin, addMovie);

publicRouter.put("/update-movie/:id", authMiddleware, isAdmin, updateMovie);

publicRouter.delete("/delete-movie/:id", authMiddleware, isAdmin, deleteMovie);

publicRouter.post("/add-show/:id", authMiddleware, isAdmin, addShow);

publicRouter.get("/theater-layout", theaterLayout);

publicRouter.post("/create-theater", authMiddleware, isAdmin, createTheater);

publicRouter.put("/update-theater/:id", authMiddleware, isAdmin, updateTheater);

module.exports = publicRouter;
