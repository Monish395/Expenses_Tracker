// backend/routes/groups.js
import express from "express";
import Group from "../models/GroupModel.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// 1️⃣ Create a new group
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, icon, members } = req.body;

    if (!name)
      return res.status(400).json({ message: "Group name is required" });

    const newGroup = new Group({
      id: Date.now().toString(),
      name,
      description: description || "",
      icon: icon || "/placeholder.png",
      code: "GRP" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdBy: req.user.uname,
      members: [
        { username: req.user.uname, role: "admin" }, // creator is admin
        ...(members || []), // other members
      ],
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2️⃣ Get all groups of the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const username = req.user.uname;
    const groups = await Group.find({ "members.username": username });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3️⃣ Join a group by code
router.post("/join", verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const username = req.user.uname;

    const group = await Group.findOne({ code });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // prevent duplicate join
    if (group.members.some((m) => m.username === username)) {
      //   console.log(username);
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    group.members.push({ username, role: "member" });
    await group.save();

    res.json({ message: `Joined group: ${group.name}`, group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /groups/leave/:groupId
// Removes logged-in user from a group
router.patch("/leave/:groupId", verifyToken, async (req, res) => {
  const { groupId } = req.params;
  const username = req.user.uname;

  try {
    const group = await Group.findOne({ id: groupId });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Remove user from members
    group.members = group.members.filter((m) => m.username !== username);

    // Optional: delete group if no members left
    if (group.members.length === 0) {
      await group.deleteOne();
      return res.json({ message: "You left the group and it was deleted" });
    }

    await group.save();
    res.json({ message: "You left the group", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /groups/:groupId
// Returns the group details including members
router.get("/:groupId", verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ id: req.params.groupId });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
