const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support');
const { authenticateToken } = require('../middlewares/auth');

router.post('/ticket', supportController.sendSupportTicket);

module.exports = router;
