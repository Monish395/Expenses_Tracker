import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import expensesRoutes from "./routes/expenses.js";
import usersRoutes from "./routes/users.js";
import groupRoutes from "./routes/groups.js";
import budgetRoutes from "./routes/budget.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Expenses Tracker API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/expenses", expensesRoutes);
app.use("/users", usersRoutes);
app.use("/groups", groupRoutes);
app.use("/budgets", budgetRoutes);
app.use("/feedback", feedbackRoutes);
