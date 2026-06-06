import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pwd: { type: String, default: "" }, // will be empty string for Google-only accounts
  uname: { type: String, required: true, unique: true },
  phone_no: { type: String },
  timestamp: { type: Date, default: Date.now() },

  googleId: { type: String, unique: true, sparse: true }, // sparse: true means null values are ignored by the unique index
  profilePic: { type: String, default: "" }, // stores URL string; empty = use default avatar on frontend
  authProvider: {
    type: String,
    enum: ["local", "google", "both"],
    default: "local",
  },
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
