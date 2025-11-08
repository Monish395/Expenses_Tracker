import express from "express";
import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// GET all users (for testing/admin)
router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST register new user
router.post("/register", async (req, res) => {
  const { email, pwd, uname, phone_no } = req.body;

  if (!email || !pwd || !uname) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  const normalizedEmail = email.toLowerCase();

  // Check if user already exists
  const existingUser_email = await UserModel.findOne({
    email: normalizedEmail,
  });
  if (existingUser_email) {
    return res
      .status(400)
      .json({ message: "User with this email already exists" });
  }

  const existingUser_uname = await UserModel.findOne({ uname: uname });
  if (existingUser_uname) {
    return res
      .status(400)
      .json({ message: "User with this uname already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(pwd, 10);

  const newUser = new UserModel({
    email: normalizedEmail,
    pwd: hashedPassword,
    uname,
    phone_no,
    timestamp: new Date().toISOString(),
  });

  try {
    await newUser.save();
    // No response needed, frontend redirects to login
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST login route
router.post("/login", async (req, res) => {
  // JWT secret key (in production, use env variables!)
  const JWT_SECRET = process.env.JWT_SECRET;
  const { email, pwd } = req.body;

  if (!email || !pwd) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found, Create account" });

    const isPasswordValid = await bcrypt.compare(pwd, user.pwd);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Incorrect password" });

    // Generate JWT (expires in 1 day)
    const token = jwt.sign(
      { id: user._id, email: user.email, uname: user.uname },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      user: {
        email: user.email,
        uname: user.uname,
        phone_no: user.phone_no,
        timestamp: user.timestamp,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /users/change-password
router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    const user = await UserModel.findOne({ uname: req.user.uname });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.pwd);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.pwd = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /users/delete
router.delete("/delete", verifyToken, async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.user.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
