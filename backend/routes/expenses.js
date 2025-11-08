// backend/routes/expenses.js
import express from "express";
import Expense from "../models/ExpenseModel.js";
import Group from "../models/GroupModel.js";
import verifyToken from "../middleware/verifyToken.js"; // middleware to check JWT

const router = express.Router();

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new expense (Group Expense in particular)
router.post("/", async (req, res) => {
  // Destructure everything you want to store
  const {
    id,
    title,
    user,
    amount,
    category,
    description,
    groupId,
    splits,
    participants,
    payers,
    settlements,
    netBalances,
    createdAt,
  } = req.body;

  const expense = new Expense({
    id,
    title,
    user,
    amount,
    category,
    description,
    groupId,
    splits,
    participants,
    payers,
    settlements,
    netBalances,
    createdAt,
  });

  try {
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET personal expenses for logged-in user
router.get("/personal", verifyToken, async (req, res) => {
  try {
    const user = req.user.uname; // from JWT payload
    const expenses = await Expense.find({ user: user });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new personal expense
router.post("/personal", verifyToken, async (req, res) => {
  const { title, amount, category, description, createdAt } = req.body;
  // console.log("JWT payload:", req.user);
  const expense = new Expense({
    id: Date.now().toString(), // unique ID
    user: req.user.uname, // tie to logged-in user
    title,
    amount,
    category,
    description,
    createdAt: createdAt || new Date().toISOString(),
  });

  try {
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) personal expense by ID
router.put("/personal/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      id: req.params.id,
      user: req.user.uname,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Update fields if provided
    ["title", "amount", "category", "description", "createdAt"].forEach(
      (field) => {
        if (req.body[field] !== undefined) expense[field] = req.body[field];
      }
    );

    const updated = await expense.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE personal expense by ID
router.delete("/personal/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      id: req.params.id,
      user: req.user.uname,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /expenses/:groupId
router.get("/:groupId", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /expenses/:expenseId - update an expense
router.patch("/:expenseId", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOne({ id: req.params.expenseId });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Update fields if provided
    [
      "title",
      "amount",
      "createdAt",
      "category",
      "description",
      "participants",
      "payers",
      "splits",
      "netBalances",
      "settlements",
    ].forEach((field) => {
      if (req.body[field] !== undefined) expense[field] = req.body[field];
    });

    const updated = await expense.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /expenses/:expenseId - delete an expense
router.delete("/:expenseId", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      id: req.params.expenseId,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted successfully", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /expenses/group/all - get all group expenses of the logged-in user.
router.get("/group/all", verifyToken, async (req, res) => {
  try {
    const username = req.user.uname;

    // Find all groups where the user is a member
    const groups = await Group.find({ "members.username": username });

    // Collect group IDs
    const groupIds = groups.map((g) => g.id);

    // Fetch expenses for these groups
    const expenses = await Expense.find({ groupId: { $in: groupIds } });

    // Map each expense to include only amount owed by this user
    const userExpenses = expenses.map((exp) => ({
      ...exp._doc,
      amount: exp.splits?.get(username) || 0, // user's share
    }));
    // console.log(userExpenses);

    res.json(userExpenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
