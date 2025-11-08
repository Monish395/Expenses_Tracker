// backend/models/BudgetModel.js
import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  // Either a user budget or a group budget
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for group budgets
  groupId: { type: String, unique: true, sparse: true }, // optional for personal budgets

  amount: { type: Number, required: true },
  interval: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    default: "monthly",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Budget", BudgetSchema);
