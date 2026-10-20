const mongoose = require("mongoose");

const workspaceModel = require("../model/workspace.model");
const WorkspaceMember = require("../model/workspaceMember.model");
const User = require("../model/user.model");

const getWorkspaceMembers = async ({ workspaceId, userId }) => {
  // Step 1: Validate workspace ID
  if (!mongoose.isValidObjectId(workspaceId)) {
    const error = new Error("Invalid workspace ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Check whether the requesting user belongs to this workspace
  const membership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!membership) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Retrieve all members of this workspace
  const members = await WorkspaceMember.find({
    workspace: workspaceId,
  })
    .populate("user", "name username email profilePicture")
    .select("-__v");

  // Step 4: Return the members
  return members;
};

const addWorkspaceMember = async ({ workspaceId, userId, memberEmail }) => {
  // Step 1: Validate workspace ID
  if (!mongoose.isValidObjectId(workspaceId)) {
    const error = new Error("Invalid workspace ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Check the requester's membership and role
  const requesterMembership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!requesterMembership) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["OWNER", "ADMIN"].includes(requesterMembership.role)) {
    const error = new Error("You do not have permission to add members");
    error.statusCode = 403;
    throw error;
  }

  if (typeof memberEmail !== "string" || !memberEmail.trim()) {
    const error = new Error("Member email is required");
    error.statusCode = 400;
    throw error;
  }

  // Step 3: Find the user to add
  const normalizedEmail = memberEmail.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    const error = new Error("Registered user not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 4: Prevent duplicate membership
  const existingMembership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: user._id,
  });

  if (existingMembership) {
    const error = new Error("User is already a member of this workspace");
    error.statusCode = 409;
    throw error;
  }

  // Step 5: Create membership
  const newMembership = await WorkspaceMember.create({
    workspace: workspaceId,
    user: user._id,
    role: "MEMBER",
  });

  // Step 6: Return the new membership with user details
  return await WorkspaceMember.findById(newMembership._id)
    .populate("user", "name username email profilePicture")
    .select("-__v");
};


const updateWorkspaceMemberRole = async ({
    workspaceId,
    memberId,
    userId,
    role
}) => {
    // Step 1: Validate IDs
    if (
        !mongoose.isValidObjectId(workspaceId) ||
        !mongoose.isValidObjectId(memberId)
    ) {
        const error = new Error("Invalid workspace or member ID");
        error.statusCode = 400;
        throw error;
    }

    // Step 2: Validate the requested role
    if (!["ADMIN", "MEMBER"].includes(role)) {
        const error = new Error("Invalid role");
        error.statusCode = 400;
        throw error;
    }

    // Step 3: Find the requester's membership
    const requesterMembership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!requesterMembership) {
        const error = new Error("Workspace not found");
        error.statusCode = 404;
        throw error;
    }

    // Step 4: Only the OWNER can change roles
    if (requesterMembership.role !== "OWNER") {
        const error = new Error(
            "Only the workspace owner can change member roles"
        );
        error.statusCode = 403;
        throw error;
    }

    // Step 5: Find the target membership in this workspace
    const targetMembership = await WorkspaceMember.findOne({
        _id: memberId,
        workspace: workspaceId
    });

    if (!targetMembership) {
        const error = new Error("Workspace member not found");
        error.statusCode = 404;
        throw error;
    }

    // Step 6: Prevent changing the OWNER's role
    if (targetMembership.role === "OWNER") {
        const error = new Error("The owner's role cannot be changed");
        error.statusCode = 403;
        throw error;
    }

    // Step 7: Update the role
    targetMembership.role = role;
    await targetMembership.save();

    // Step 8: Return updated membership with user details
    return await WorkspaceMember.findById(targetMembership._id)
        .populate("user", "name username email profilePicture")
        .select("-__v");
};

const removeWorkspaceMember = async ({
  workspaceId,
  memberId,
  userId
}) => {
  // 1. Validate IDs
  if (
    !mongoose.isValidObjectId(workspaceId) ||
    !mongoose.isValidObjectId(memberId)
  ) {
    const error = new Error("Invalid workspace or member ID");
    error.statusCode = 400;
    throw error;
  }

  // 2. Check requester's membership
  const requesterMembership = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId
  });

  if (!requesterMembership) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  // 3. Check permission
  if (!["OWNER", "ADMIN"].includes(requesterMembership.role)) {
    const error = new Error(
      "You do not have permission to remove members"
    );
    error.statusCode = 403;
    throw error;
  }

  // 4. Find the target member
  const targetMembership = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId
  });

  if (!targetMembership) {
    const error = new Error("Workspace member not found");
    error.statusCode = 404;
    throw error;
  }

  // 5. Protect the owner
  if (targetMembership.role === "OWNER") {
    const error = new Error("The workspace owner cannot be removed");
    error.statusCode = 403;
    throw error;
  }

  // 6. Delete membership
  await WorkspaceMember.findByIdAndDelete(targetMembership._id);

  return {
    memberId: targetMembership._id,
    workspaceId: targetMembership.workspace
  };
};

module.exports = {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember
};
