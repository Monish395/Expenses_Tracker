import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uname: { type: String, required: true }, // for display without joining users collection
  email: { type: String }, // optional
  rating: { type: Number, min: 1, max: 5 }, // optional star rating
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", FeedbackSchema);
