import express from "express";
import Budget from "../models/BudgetModel.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ---------------- Personal Budgets ---------------- */

// GET personal budget for logged-in user
router.get("/personal", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    res.json(budget || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST or UPDATE personal budget
router.post("/personal", verifyToken, async (req, res) => {
  try {
    const { amount, interval } = req.body;
    let budget = await Budget.findOne({ userId: req.user._id });

    if (budget) {
      // Update existing
      budget.amount = amount;
      budget.interval = interval;
      await budget.save();
    } else {
      // Create new
      budget = new Budget({
        userId: req.user._id,
        amount,
        interval,
      });
      await budget.save();
    }

    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ---------------- Group Budgets ---------------- */

// GET budget for a group
router.get("/group/:groupId", verifyToken, async (req, res) => {
  try {
    const budget = await Budget.findOne({ groupId: req.params.groupId });
    res.json(budget || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST or UPDATE group budget
router.post("/group/:groupId", verifyToken, async (req, res) => {
  try {
    const { amount, interval } = req.body;
    let budget = await Budget.findOne({ groupId: req.params.groupId });

    if (budget) {
      // Update existing
      budget.amount = amount;
      budget.interval = interval;
      await budget.save();
    } else {
      // Create new
      budget = new Budget({
        groupId: req.params.groupId,
        amount,
        interval,
      });
      await budget.save();
    }

    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
