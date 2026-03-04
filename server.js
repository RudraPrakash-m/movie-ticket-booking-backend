const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const publicRouter = require("./users/public/routes/publicRouter");
const connectDB = require("./congif/db/db");
const privateRouter = require("./users/private/routes/privateRouter");
const AdminRouter = require("./users/admin/routes/adminRoute");
const isAdmin = require("./middlewares/isAdmin");
const authMiddleware = require("./middlewares/Authentication");

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

connectDB();

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  return res.json({ message: "This is my test api" });
});

app.use("/api", publicRouter);

app.use("/api/user", privateRouter);

app.use("/api/admin", authMiddleware, isAdmin, AdminRouter);

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
