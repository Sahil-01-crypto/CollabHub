const workspaceModel = require("../model/workspace.model");
  const {
    createWorkspace: createWorkspaceService,
    getUserWorkspaces
} = require("../services/workspaceService");

const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    const createdWorkspace = await createWorkspaceService({
      name: name.trim(),
      description,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace: createdWorkspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);

    return res.status(500).json({
      message: "Error creating workspace",
    });
  }
};

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

module.exports = {
  createWorkspace,
  getWorkspaces
};