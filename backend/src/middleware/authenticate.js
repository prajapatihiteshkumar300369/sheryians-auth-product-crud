const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (payload.type !== "access") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const user = await User.findById(payload.sub).select("_id name email");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

module.exports = authenticate;
