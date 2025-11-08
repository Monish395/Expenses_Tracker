import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pwd: { type: String, required: true },
  uname: { type: String, required: true, unique: true },
  phone_no: { type: String },
  timestamp: { type: Date, default: Date.now() },
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
