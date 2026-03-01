const express = require("express");
const authMiddleware = require("../../../middlewares/Authentication");
const { toggleFavourite } = require("../controller/privateController");

const privateRouter = express.Router();

privateRouter.patch("/toggle-favourite", authMiddleware, toggleFavourite);

module.exports = privateRouter;
