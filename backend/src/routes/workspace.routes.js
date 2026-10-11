const express = require('express');
const middleware = require('../middlewares/auth.middlewares');
const workspaceController = require('../controllers/workspace.controllers');

const router = express.Router();

router.post('/', middleware.authUser, workspaceController.createWorkspace);


router.get('/', middleware.authUser, workspaceController.getWorkspaces);

router.get("/:workspaceId", middleware.authUser, workspaceController.getWorkspaceByIds);

router.patch("/:workspaceId", middleware.authUser, workspaceController.updateWorkspace);

router.delete("/:workspaceId", middleware.authUser, workspaceController.deleteWorkspace);

module.exports = router;