import express from "express";
import Feedback from "../models/FeedbackModel.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// POST new feedback
router.post("/", verifyToken, async (req, res) => {
  //   console.log("req.user:", req.user);
  try {
    const { message, rating } = req.body;

    if (!message)
      return res.status(400).json({ message: "Feedback message is required" });

    const feedback = new Feedback({
      userId: req.user.id,
      uname: req.user.uname,
      email: req.user.email,
      message,
      rating: rating || null,
    });

    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // newest first
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reviews (optionally only ratings + message)
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Feedback.find(
      {},
      { uname: 1, rating: 1, message: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
