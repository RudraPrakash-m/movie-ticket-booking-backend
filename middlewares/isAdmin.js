module.exports = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

//   console.log(req.user);
  

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
