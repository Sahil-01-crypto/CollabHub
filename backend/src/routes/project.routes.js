const express = require("express");
const middleware = require("../middlewares/auth.middlewares");
const projectController = require("../controllers/project.controller");

const router = express.Router();

router.post(
  "/:workspaceId/projects",
  middleware.authUser,
  projectController.createProject,
);

router.get(
  "/:workspaceId/projects",
  middleware.authUser,
  projectController.getWorkspaceProjects,
);

router.patch('/:workspaceId/projects/:projectId',
  middleware.authUser,
  projectController.updateProject
);

router.delete('/:workspaceId/projects/:projectId',
  middleware.authUser,
  projectController.deleteProject
);

module.exports = router;
