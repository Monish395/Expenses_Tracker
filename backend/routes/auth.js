import express from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import verifyToken from "../middleware/verifyToken.js";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, uname: user.uname },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

const buildUserPayload = (user) => ({
  email: user.email,
  uname: user.uname,
  phone_no: user.phone_no,
  profilePic: user.profilePic,
  authProvider: user.authProvider,
  timestamp: user.timestamp,
});

// ── STEP 1: Redirect user to Google ──────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// ── STEP 2: Google redirects back here ───────────────────────────────────────
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    console.log("OAuth callback hit");
    console.log("err:", err);
    console.log("user:", user?._id);
    console.log("info:", info);
    console.log("req.pendingToken:", req.pendingToken);

    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }

    if (!user && info?.message === "account_exists_link_required") {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=account_exists&hint=link&pendingToken=${req.pendingToken}`,
      );
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const token = generateToken(user);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
});

// ── Link Google to existing local account (user must be logged in) ────────────
router.get(
  "/google/link",
  verifyToken,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/google/link/callback", verifyToken, (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/settings?error=link_failed`,
      );
    }
    const token = generateToken(user);
    res.redirect(
      `${process.env.CLIENT_URL}/settings?linked=true&token=${token}`,
    );
  })(req, res, next);
});

// ── Link Google to local account using password verification ─────────────────
router.post("/google/link-by-password", async (req, res) => {
  const { password, pendingToken } = req.body;

  if (!password || !pendingToken) {
    return res.status(400).json({ message: "Password and token are required" });
  }

  try {
    let payload;
    try {
      payload = jwt.verify(pendingToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        message: "Link session expired. Please try Google sign-in again.",
      });
    }

    const { googleId, profilePic, email } = payload;

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    if (user.authProvider === "google") {
      return res
        .status(400)
        .json({ message: "This account already uses Google login" });
    }

    const isMatch = await bcrypt.compare(password, user.pwd);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    user.googleId = googleId;
    user.authProvider = "both";
    if (!user.profilePic && profilePic) user.profilePic = profilePic;
    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Google account linked successfully",
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get current user profile ──────────────────────────────────────────────────
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: buildUserPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
