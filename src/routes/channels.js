const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channels');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, channelController.getChannels);
router.post('/', authenticateToken, channelController.createChannel);
router.put('/:id', authenticateToken, channelController.renameChannel);
router.delete('/:id', authenticateToken, channelController.deleteChannel);

module.exports = router;
