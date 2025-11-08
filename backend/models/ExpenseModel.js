// backend/models/ExpenseModel.js
import mongoose from "mongoose";

const payerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
});

const settlementSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
});

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  createdAt: { type: String, default: Date.now },
  user: { type: String }, // only for personal expenses
  groupId: { type: String }, // only for group expenses
  participants: { type: [String], default: [] }, // group expense participants
  payers: { type: [payerSchema], default: [] }, // group expense payers
  splits: { type: Map, of: Number, default: {} }, // user -> share
  netBalances: { type: Map, of: Number, default: {} }, // user -> balance
  settlements: { type: [settlementSchema], default: [] },
});

const ExpenseModel = mongoose.model("Expense", expenseSchema);

export default ExpenseModel;
