const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function createAccessToken(userId) {
  return jwt.sign(
    { sub: userId.toString(), type: "access" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

function createRefreshToken(userId) {
  return jwt.sign(
    { sub: userId.toString(), type: "refresh" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setRefreshCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth"
  });
}

function clearRefreshCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth"
  });
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshCookie,
  clearRefreshCookie
};
