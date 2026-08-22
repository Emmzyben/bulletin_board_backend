const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, notificationsController.getNotifications);
router.put('/read-all', authenticateToken, notificationsController.markAllAsRead);
router.put('/:id/read', authenticateToken, notificationsController.markAsRead);

module.exports = router;
