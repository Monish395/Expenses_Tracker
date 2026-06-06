import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import MongoStore from "connect-mongo";

import expensesRoutes from "./routes/expenses.js";
import usersRoutes from "./routes/users.js";
import groupRoutes from "./routes/groups.js";
import budgetRoutes from "./routes/budget.js";
import feedbackRoutes from "./routes/feedback.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // needed for passport session cookie during OAuth handshake
  }),
);
app.use(express.json());

// Session is only used during the OAuth redirect handshake, not for API auth
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // reuses your existing Atlas connection
      ttl: 5 * 60, // session expires in 5 minutes
    }),
    cookie: { secure: true, sameSite: "none", maxAge: 5 * 60 * 1000 }, // 5 min expiration since we only use this for temporary OAuth linking data
  }),
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Expenses Tracker API is running"));

app.use("/auth", authRoutes); // ← new
app.use("/expenses", expensesRoutes);
app.use("/users", usersRoutes);
app.use("/groups", groupRoutes);
app.use("/budgets", budgetRoutes);
app.use("/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
