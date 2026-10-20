const {
    createWorkspace: createWorkspaceService,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace: updateWorkspaceService,
    deleteWorkspace: deleteWorkspaceService
} = require("../services/workspace.Service");


// CREATE WORKSPACE
const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Workspace name is required"
            });
        }

        const createdWorkspace = await createWorkspaceService({
            name: name.trim(),
            description,
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Workspace created successfully",
            workspace: createdWorkspace
        });

    } catch (error) {
        console.error("Create workspace error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Error creating workspace"
        });
    }
};


// GET ALL WORKSPACES FOR THE LOGGED-IN USER
const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await getUserWorkspaces(req.user.id);

        return res.status(200).json({
            message: "Workspaces fetched successfully",
            workspaces
        });

    } catch (error) {
        console.error("Get workspaces error:", error);

        return res.status(500).json({
            message: "Error fetching workspaces"
        });
    }
};


// GET WORKSPACE BY ID
const getWorkspaceByIds = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await getWorkspaceById({
            workspaceId,
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Workspace fetched successfully",
            workspace
        });

    } catch (error) {
        console.error("Get workspace by ID error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Error fetching workspace"
        });
    }
};


// UPDATE WORKSPACE
const updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description } = req.body;

        const updatedWorkspace = await updateWorkspaceService({
            workspaceId,
            userId: req.user.id,
            name,
            description
        });

        return res.status(200).json({
            message: "Workspace updated successfully",
            workspace: updatedWorkspace
        });

    } catch (error) {
        console.error("Update workspace error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Error updating workspace"
        });
    }
};


// DELETE WORKSPACE
const deleteWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        await deleteWorkspaceService({
            workspaceId,
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Workspace deleted successfully"
        });

    } catch (error) {
        console.error("Delete workspace error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Error deleting workspace"
        });
    }
};


// EXPORT CONTROLLERS
module.exports = {
    createWorkspace,
    getWorkspaces,
    getWorkspaceByIds,
    updateWorkspace,
    deleteWorkspace
};