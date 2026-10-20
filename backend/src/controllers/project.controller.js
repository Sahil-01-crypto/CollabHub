const {
    createProject: createProjectService,
    getWorkspaceProjects: getWorkspaceProjectsService ,
    updateProject: updateProjectService,
    deleteProject: deleteProjectService
} = require("../services/project.service");

const createProject = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description } = req.body;

        const project = await createProjectService({
            name,
            description,
            workspaceId,
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error) {
        console.error("Error creating project:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const getWorkspaceProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const projects = await getWorkspaceProjectsService({
            workspaceId,
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Projects fetched successfully",
            projects
        });
    } catch (error) {
        console.error("Error fetching workspace projects:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const { workspaceId, projectId } = req.params;
        const { name, description, status } = req.body;

        const project = await updateProjectService({
            workspaceId,
            projectId,
            userId: req.user.id,
            name,
            description,
            status
        });

        return res.status(200).json({
            message: "Project updated successfully",
            project
        });
    } catch (error) {
        console.error("Error updating project:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { workspaceId, projectId } = req.params;

        const project = await deleteProjectService({
            workspaceId,
            projectId,
            userId: req.user.id
        });

        return res.status(200).json({
            message: "Project deleted successfully",
            project
        });
    } catch (error) {
        console.error("Error deleting project:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};






module.exports = { createProject, getWorkspaceProjects , updateProject , deleteProject}; 