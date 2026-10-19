const express = require('express');
const middleware = require('../middlewares/auth.middlewares');
const workspaceMemberController = require('../controllers/workspaceMember.controller');
const router = express.Router();

router.get('/:workspaceId/members', middleware.authUser, workspaceMemberController.getWorkspaceMembers);
router.post('/:workspaceId/members', middleware.authUser, workspaceMemberController.addWorkspaceMember);
router.patch('/:workspaceId/members/:memberId/role', middleware.authUser, workspaceMemberController.updateWorkspaceMemberRole);
router.delete('/:workspaceId/members/:memberId', middleware.authUser, workspaceMemberController.removeWorkspaceMember);


module.exports = router;

