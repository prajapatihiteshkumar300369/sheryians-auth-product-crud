const express = require("express");
const rateLimit = require("express-rate-limit");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const {
  registerValidator,
  loginValidator
} = require("../validators/authValidators");
const {
  register,
  login,
  refreshToken,
  logout,
  me
} = require("../controllers/authController");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Try again later." }
});

router.post("/register", registerValidator, validate, register);
router.post("/login", loginLimiter, loginValidator, validate, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

module.exports = router;
