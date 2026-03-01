const USER_MODEL = require("../../../models/userModel");

const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
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
      { $pull: { favourites: movieId } }
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
      { $addToSet: { favourites: movieId } }
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
module.exports = {toggleFavourite}