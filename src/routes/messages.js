const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, messageController.getMessages);
router.post('/', authenticateToken, messageController.createMessage);
router.put('/:id/reactions', authenticateToken, messageController.updateReactions);

module.exports = router;
