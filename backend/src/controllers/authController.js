const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshCookie,
  clearRefreshCookie
} = require("../utils/tokens");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return res.status(201).json({
    message: "Registration successful",
    user: publicUser(user)
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);

  return res.json({
    message: "Login successful",
    accessToken,
    user: publicUser(user)
  });
}

async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (payload.type !== "refresh") {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.sub).select("+refreshTokenHash");

    if (!user || !user.refreshTokenHash) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const incomingHash = hashToken(token);

    if (incomingHash !== user.refreshTokenHash) {
      user.refreshTokenHash = null;
      await user.save();
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid or reused refresh token" });
    }

    // Rotation: old refresh token is replaced with a new one.
    const newRefreshToken = createRefreshToken(user._id);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    const accessToken = createAccessToken(user._id);

    return res.json({ accessToken });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({
      message: "Invalid or expired refresh token"
    });
  }
}

async function logout(req, res) {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshTokenHash: null }
  });

  clearRefreshCookie(res);

  return res.json({ message: "Logged out successfully" });
}

async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, refreshToken, logout, me };
