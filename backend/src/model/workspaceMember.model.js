const mongoose = require("mongoose");

const workspacememberSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["OWNER", "ADMIN", "MEMBER"],
    default: "member",
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspacememberSchema,
);

module.exports = WorkspaceMember;
