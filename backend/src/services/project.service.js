const mongoose = require("mongoose");
const projectModel = require("../model/project.model");
const workspaceMemberModel = require("../model/workspaceMember.model");

const createProject = async ({
    name,
    description,
    workspaceId,
    userId
}) => {
    // 1. Validate workspace ID
    if (!mongoose.isValidObjectId(workspaceId)) {
        const error = new Error("Invalid workspace ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate project name
    if (typeof name !== "string" || !name.trim()) {
        const error = new Error("Project name is required");
        error.statusCode = 400;
        throw error;
    }

    // 3. Validate description
    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        const error = new Error("Description must be a string");
        error.statusCode = 400;
        throw error;
    }

    // 4. Check workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("Workspace not found");
        error.statusCode = 404;
        throw error;
    }

    // 5. Create project
    const project = await projectModel.create({
        name: name.trim(),
        description: description?.trim() ?? "",
        workspace: workspaceId,
        createdBy: userId
    });

    return project;
};

const getWorkspaceProjects = async ({ workspaceId, userId }) => {
    // 1. Validate workspace ID
    if (!mongoose.isValidObjectId(workspaceId)) {
        const error = new Error("Invalid workspace ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Check workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("Workspace not found");
        error.statusCode = 404;
        throw error;
    }

    // 3. Fetch projects belonging to this workspace
    const projects = await projectModel
        .find({ workspace: workspaceId })
        .sort({ createdAt: -1 });

    return projects;
};

const updateProject = async ({
    workspaceId,
    projectId,
    userId,
    name,
    description,
    status
}) => {
    // 1. Validate IDs
    if (
        !mongoose.isValidObjectId(workspaceId) ||
        !mongoose.isValidObjectId(projectId)
    ) {
        const error = new Error("Invalid workspace or project ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Check workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("Workspace not found");
        error.statusCode = 404;
        throw error;
    }

    // 3. Check permission
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
        const error = new Error(
            "You do not have permission to update projects"
        );
        error.statusCode = 403;
        throw error;
    }

    // 4. Validate supplied fields
    const updates = {};

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            const error = new Error("Project name cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        updates.name = name.trim();
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            const error = new Error("Description must be a string");
            error.statusCode = 400;
            throw error;
        }

        updates.description = description.trim();
    }

    if (status !== undefined) {
        const allowedStatuses = [
            "PLANNING",
            "ACTIVE",
            "COMPLETED",
            "ON_HOLD"
        ];

        if (!allowedStatuses.includes(status)) {
            const error = new Error("Invalid project status");
            error.statusCode = 400;
            throw error;
        }

        updates.status = status;
    }

    // 5. Reject empty updates
    if (Object.keys(updates).length === 0) {
        const error = new Error("Provide at least one field to update");
        error.statusCode = 400;
        throw error;
    }

    // 6. Update only a project in this workspace
    const project = await projectModel.findOneAndUpdate(
        {
            _id: projectId,
            workspace: workspaceId
        },
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    );

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    return project;
};

const deleteProject = async ({
    workspaceId,
    projectId,
    userId
}) => {
    // 1. Validate IDs
    if (
        !mongoose.isValidObjectId(workspaceId) ||
        !mongoose.isValidObjectId(projectId)
    ) {
        const error = new Error("Invalid workspace or project ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Check workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("Workspace not found");
        error.statusCode = 404;
        throw error;
    }

    // 3. Check permission
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
        const error = new Error(
            "You do not have permission to delete projects"
        );
        error.statusCode = 403;
        throw error;
    }

    // 4. Delete the project belonging to this workspace
    const project = await projectModel.findOneAndDelete({
        _id: projectId,
        workspace: workspaceId
    });

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    return project;
};


module.exports = {
    createProject,
    getWorkspaceProjects,
    updateProject,
    deleteProject
};