const express = require("express");
const {
  publicPage,
  register,
  login,
  me,
  logout,
} = require("../controller/publicController");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../../../middlewares/Authentication");

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

module.exports = publicRouter;
