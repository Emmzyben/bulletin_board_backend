const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaces');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, workspaceController.getWorkspaces);
router.post('/', authenticateToken, workspaceController.createWorkspace);
router.put('/:id/members', authenticateToken, workspaceController.updateMembers);

module.exports = router;
