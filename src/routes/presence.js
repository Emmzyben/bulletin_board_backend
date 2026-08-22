const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presence');
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, presenceController.upsertPresence);
router.put('/last_read', authenticateToken, presenceController.markLastRead);
router.post('/offline', authenticateToken, presenceController.markOffline);
router.get('/:workspaceId', authenticateToken, presenceController.getPresence);

module.exports = router;
