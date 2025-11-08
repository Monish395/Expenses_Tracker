import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // unique group ID
  code: { type: String, required: true, unique: true }, // optional: invite/join code
  name: { type: String, required: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "/placeholder.png" },
  createdBy: { type: String, required: true },
  members: [
    {
      username: { type: String, required: true },
      role: { type: String, enum: ["admin", "member"], default: "member" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const GroupModel = mongoose.model("Group", GroupSchema);
export default GroupModel;
