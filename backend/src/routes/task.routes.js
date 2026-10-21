const express = require("express");
const authMiddleware = require("../middlewares/auth.middlewares");
const createTask = require("../controllers/task.controller");

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/projects/:projectId/tasks",
  authMiddleware.authUser,
  createTask.createTaskController,
);
router.get(
  "/workspaces/:workspaceId/projects/:projectId/tasks",
  authMiddleware.authUser,
  createTask.getProjectTasksController,
);
router.patch(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
  authMiddleware.authUser,
  createTask.updateTaskController,
);
router.patch(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/status",
  authMiddleware.authUser,
  createTask.updateTaskStatusController,
);
router.patch(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/assignee",
  authMiddleware.authUser,
  createTask.assignTaskController,
);

router.delete(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
  authMiddleware.authUser,
  createTask.deleteTaskController,
);

module.exports = router;
