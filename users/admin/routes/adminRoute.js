const express = require("express");
const USER_MODEL = require("../../../models/userModel");

const AdminRouter = express.Router();

AdminRouter.get("/users", async (req, res) => {
  try {
    const users = await USER_MODEL.find().select("-password -otp");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

AdminRouter.get("/users/:id", async (req, res) => {
  try {
    const user = await USER_MODEL.findById(req.params.id).select(
      "-password -otp",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

AdminRouter.put("/users/:id", async (req, res) => {
  try {
    const { name, email, role, isVerified } = req.body;

    const updatedUser = await USER_MODEL.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isVerified },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

AdminRouter.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await USER_MODEL.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

AdminRouter.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await USER_MODEL.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password -otp");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Role update failed" });
  }
});

module.exports = AdminRouter;
