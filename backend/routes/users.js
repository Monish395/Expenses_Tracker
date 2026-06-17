import express from "express";
import UserModel from "../models/UserModel.js";
import ExpenseModel from "../models/ExpenseModel.js";
import BudgetModel from "../models/BudgetModel.js";
import GroupModel from "../models/GroupModel.js";
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
    profilePic: "",
    authProvider: "local",
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
      },
    );

    res.status(200).json({
      user: {
        email: user.email,
        uname: user.uname,
        phone_no: user.phone_no,
        profilePic: user.profilePic,
        authProvider: user.authProvider,
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
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both fields are required" });

    const user = await UserModel.findOne({ uname: req.user.uname });
    if (!user) return res.status(404).json({ message: "User not found" });

    //block OAuth-only users
    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "Your account uses Google login. No password to change.",
      });
    }

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

// PATCH /users/update-profile
router.patch("/update-profile", verifyToken, async (req, res) => {
  try {
    const { uname, phone_no } = req.body;

    if (!uname?.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (phone_no && !/^\d{10}$/.test(phone_no)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    // Check if new uname is taken by someone else
    const existing = await UserModel.findOne({ uname });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { uname, phone_no },
      { new: true },
    );

    res.json({ user: { uname: user.uname, phone_no: user.phone_no } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /users/update-profile-pic
router.patch("/update-profile-pic", verifyToken, async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Basic validation — must be a base64 image string
    if (!profilePic.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { profilePic },
      { new: true },
    );

    res.json({ profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /users/delete
router.delete("/delete", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const uname = user.uname; // adjust field name if different (e.g. user.username)
    const ANON = "Deleted User";

    // 1. Hard delete personal expenses
    await ExpenseModel.deleteMany({ user: uname });

    // 2. Hard delete personal budgets
    await BudgetModel.deleteMany({ userId: user._id });

    // 3. Process groups the user belongs to
    const groups = await GroupModel.find({ "members.username": uname });

    for (const group of groups) {
      const remainingMembers = group.members.filter(
        (m) => m.username !== uname,
      );

      if (remainingMembers.length === 0) {
        // Group becomes empty -> delete group + its expenses + its budget
        await ExpenseModel.deleteMany({ groupId: group.id });
        await BudgetModel.deleteOne({ groupId: group.id });
        await GroupModel.deleteOne({ _id: group._id });
        continue;
      }

      // Reassign ownership if creator/admin is leaving and others remain
      const wasCreator = group.createdBy === uname;
      const leavingMember = group.members.find((m) => m.username === uname);
      const wasAdmin = leavingMember?.role === "admin";

      if (wasCreator || wasAdmin) {
        // Promote an existing admin, else promote the first remaining member
        let newOwner = remainingMembers.find((m) => m.role === "admin");
        if (!newOwner) {
          newOwner = remainingMembers[0];
          newOwner.role = "admin";
        }
        if (wasCreator) {
          group.createdBy = newOwner.username;
        }
      }

      group.members = remainingMembers;
      await group.save();

      // Anonymize this user's identifier in this group's expenses
      const groupExpenses = await ExpenseModel.find({ groupId: group.id });

      for (const exp of groupExpenses) {
        let modified = false;

        // participants
        if (exp.participants.includes(uname)) {
          exp.participants = exp.participants.map((p) =>
            p === uname ? ANON : p,
          );
          modified = true;
        }

        // payers
        exp.payers.forEach((p) => {
          if (p.name === uname) {
            p.name = ANON;
            modified = true;
          }
        });

        // splits (Map: user -> share)
        if (exp.splits.has(uname)) {
          const val = exp.splits.get(uname);
          exp.splits.delete(uname);
          // Merge into existing "Deleted User" entry if present, else set
          exp.splits.set(ANON, (exp.splits.get(ANON) || 0) + val);
          modified = true;
        }

        // netBalances (Map: user -> balance)
        if (exp.netBalances.has(uname)) {
          const val = exp.netBalances.get(uname);
          exp.netBalances.delete(uname);
          exp.netBalances.set(ANON, (exp.netBalances.get(ANON) || 0) + val);
          modified = true;
        }

        // settlements
        exp.settlements.forEach((s) => {
          if (s.from === uname) {
            s.from = ANON;
            modified = true;
          }
          if (s.to === uname) {
            s.to = ANON;
            modified = true;
          }
        });

        if (modified) await exp.save();
      }
    }

    // 4. Delete user document last
    await UserModel.findByIdAndDelete(req.user.id);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
