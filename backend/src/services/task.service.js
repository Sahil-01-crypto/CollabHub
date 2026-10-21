const mongoose = require("mongoose");

const taskModel = require("../model/task.model");
const projectModel = require("../model/project.model");
const workspaceMemberModel = require("../model/workspaceMember.model");

const createTask = async ({
    title,
    description,
    workspaceId,
    projectId,
    userId,
    assignedTo,
    priority,
    dueDate
}) => {

    // 1. Validate workspace and project IDs
    if (
        !mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(projectId)
    ) {
        const error = new Error("Invalid workspace or project ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate task title
    if (typeof title !== "string" || !title.trim()) {
        const error = new Error("Task title is required");
        error.statusCode = 400;
        throw error;
    }

    // 3. Check whether the requesting user belongs to the workspace
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("You are not a member of this workspace");
        error.statusCode = 403;
        throw error;
    }

    // 4. Verify that the project belongs to this workspace
    const project = await projectModel.findOne({
        _id: projectId,
        workspace: workspaceId
    });

    if (!project) {
        const error = new Error("Project not found in this workspace");
        error.statusCode = 404;
        throw error;
    }

    // 5. If an assignee was provided, verify workspace membership
    if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            const error = new Error("Invalid assignee ID");
            error.statusCode = 400;
            throw error;
        }

        const assigneeMembership = await workspaceMemberModel.findOne({
            workspace: workspaceId,
            user: assignedTo
        });

        if (!assigneeMembership) {
            const error = new Error(
                "The assigned user must belong to this workspace"
            );
            error.statusCode = 400;
            throw error;
        }
    }

    // 6. Validate priority if provided
    const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    if (priority !== undefined && !allowedPriorities.includes(priority)) {
        const error = new Error("Invalid task priority");
        error.statusCode = 400;
        throw error;
    }

    // 7. Validate due date if provided
    let parsedDueDate;

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
        parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
            const error = new Error("Invalid due date");
            error.statusCode = 400;
            throw error;
        }
    }

    // 8. Create the task
    const task = await taskModel.create({
        title: title.trim(),
        description,
        workspace: workspaceId,
        project: projectId,
        createdBy: userId,
        assignedTo: assignedTo || null,
        priority: priority || "MEDIUM",
        dueDate: parsedDueDate || null
    });

    return task;
};


const getProjectTasks = async ({ workspaceId, projectId, userId }) => {
    // 1. Validate workspace and project IDs
    if (
        !mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(projectId)
    ) {
        const error = new Error("Invalid workspace or project ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Verify workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("You are not a member of this workspace");
        error.statusCode = 403;
        throw error;
    }

    // 3. Verify that the project belongs to the workspace
    const project = await projectModel.findOne({
        _id: projectId,
        workspace: workspaceId
    });

    if (!project) {
        const error = new Error("Project not found in this workspace");
        error.statusCode = 404;
        throw error;
    }

    // 4. Retrieve tasks for this project
    const tasks = await taskModel.find({
        workspace: workspaceId,
        project: projectId
    }).sort({ createdAt: -1 });

    return tasks;
};


const updateTask = async ({
    workspaceId,
    projectId,
    taskId,
    userId,
    title,
    description,
    priority,
    dueDate
}) => {
    // 1. Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        const error = new Error("Invalid workspace, project, or task ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Find the user's workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("You are not a member of this workspace");
        error.statusCode = 403;
        throw error;
    }

    // 3. Find the task in the specified project and workspace
    const task = await taskModel.findOne({
        _id: taskId,
        project: projectId,
        workspace: workspaceId
    });

    if (!task) {
        const error = new Error("Task not found in this project");
        error.statusCode = 404;
        throw error;
    }

    // 4. Check whether the user has permission to update the task
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

    const isCreator = task.createdBy.toString() === userId.toString();

    const isAssignee =
        task.assignedTo &&
        task.assignedTo.toString() === userId.toString();

    if (!isAdmin && !isCreator && !isAssignee) {
        const error = new Error("You do not have permission to update this task");
        error.statusCode = 403;
        throw error;
    }

    // 5. Build the update object using only supplied fields
    const updates = {};

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            const error = new Error("Task title cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        if (title.trim().length > 150) {
            const error = new Error("Task title cannot exceed 150 characters");
            error.statusCode = 400;
            throw error;
        }

        updates.title = title.trim();
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            const error = new Error("Description must be a string");
            error.statusCode = 400;
            throw error;
        }

        if (description.length > 2000) {
            const error = new Error("Description cannot exceed 2000 characters");
            error.statusCode = 400;
            throw error;
        }

        updates.description = description.trim();
    }

    if (priority !== undefined) {
        const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

        if (!allowedPriorities.includes(priority)) {
            const error = new Error("Invalid task priority");
            error.statusCode = 400;
            throw error;
        }

        updates.priority = priority;
    }

    if (dueDate !== undefined) {
        if (dueDate === null || dueDate === "") {
            updates.dueDate = null;
        } else {
            const parsedDueDate = new Date(dueDate);

            if (Number.isNaN(parsedDueDate.getTime())) {
                const error = new Error("Invalid due date");
                error.statusCode = 400;
                throw error;
            }

            updates.dueDate = parsedDueDate;
        }
    }

    // 6. Ensure at least one field was supplied
    if (Object.keys(updates).length === 0) {
        const error = new Error("Provide at least one field to update");
        error.statusCode = 400;
        throw error;
    }

    // 7. Update the task
    const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    );

    return updatedTask;
};

const updateTaskStatus = async ({
    workspaceId,
    projectId,
    taskId,
    userId,
    status
}) => {
    // 1. Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        const error = new Error("Invalid workspace, project, or task ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate the new status
    const allowedStatuses = [
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "DONE"
    ];

    if (!allowedStatuses.includes(status)) {
        const error = new Error("Invalid task status");
        error.statusCode = 400;
        throw error;
    }

    // 3. Verify workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("You are not a member of this workspace");
        error.statusCode = 403;
        throw error;
    }

    // 4. Find the task in the specified project and workspace
    const task = await taskModel.findOne({
        _id: taskId,
        project: projectId,
        workspace: workspaceId
    });

    if (!task) {
        const error = new Error("Task not found in this project");
        error.statusCode = 404;
        throw error;
    }

    // 5. Check update permissions
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

    const isCreator =
        task.createdBy.toString() === userId.toString();

    const isAssignee =
        task.assignedTo &&
        task.assignedTo.toString() === userId.toString();

    if (!isAdmin && !isCreator && !isAssignee) {
        const error = new Error(
            "You do not have permission to update this task's status"
        );
        error.statusCode = 403;
        throw error;
    }

    // 6. Update the status
    task.status = status;

    await task.save();

    return task;
};


const assignTask = async ({
    workspaceId,
    projectId,
    taskId,
    userId,
    assignedTo
}) => {
    // 1. Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        const error = new Error("Invalid workspace, project, or task ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Check whether the requester belongs to the workspace
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("You are not a member of this workspace");
        error.statusCode = 403;
        throw error;
    }

    // 3. Find the task inside the specified project and workspace
    const task = await taskModel.findOne({
        _id: taskId,
        project: projectId,
        workspace: workspaceId
    });

    if (!task) {
        const error = new Error("Task not found in this project");
        error.statusCode = 404;
        throw error;
    }

    // 4. Check assignment permissions
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

    const isCreator =
        task.createdBy.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
        const error = new Error(
            "Only the task creator, workspace owner, or admin can assign this task"
        );
        error.statusCode = 403;
        throw error;
    }

    // 5. Validate the new assignee, unless unassigning
    if (assignedTo !== null && assignedTo !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            const error = new Error("Invalid assignee ID");
            error.statusCode = 400;
            throw error;
        }

        const assigneeMembership = await workspaceMemberModel.findOne({
            workspace: workspaceId,
            user: assignedTo
        });

        if (!assigneeMembership) {
            const error = new Error(
                "The assignee must be a member of this workspace"
            );
            error.statusCode = 400;
            throw error;
        }

        task.assignedTo = assignedTo;
    } else {
        // Null or omitted assignedTo means unassign the task
        task.assignedTo = null;
    }

    // 6. Save changes
    await task.save();

    // 7. Return task with assignee details
    await task.populate(
        "assignedTo",
        "name username email profilePicture"
    );

    return task;
};

const deleteTask = async ({
    workspaceId,
    projectId,
    taskId,
    userId
}) => {
    // 1. Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(taskId)
    ) {
        const error = new Error("Invalid workspace, project, or task ID");
        error.statusCode = 400;
        throw error;
    }

    // 2. Verify workspace membership
    const membership = await workspaceMemberModel.findOne({
        workspace: workspaceId,
        user: userId
    });

    if (!membership) {
        const error = new Error("You are not a member of this workspace");
        error.statusCode = 403;
        throw error;
    }

    // 3. Find the task in the specified project and workspace
    const task = await taskModel.findOne({
        _id: taskId,
        project: projectId,
        workspace: workspaceId
    });

    if (!task) {
        const error = new Error("Task not found in this project");
        error.statusCode = 404;
        throw error;
    }

    // 4. Check deletion permissions
    const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

    const isCreator =
        task.createdBy.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
        const error = new Error(
            "Only the task creator, workspace owner, or admin can delete this task"
        );
        error.statusCode = 403;
        throw error;
    }

    // 5. Delete the task
    await taskModel.deleteOne({ _id: task._id });

    return {
        taskId: task._id,
        message: "Task deleted successfully"
    };
};


module.exports = {
    createTask,
    getProjectTasks,
    updateTask,
    updateTaskStatus ,
    assignTask ,
    deleteTask
};