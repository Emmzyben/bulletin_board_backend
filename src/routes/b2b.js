const express = require('express');
const router = express.Router();
const b2bController = require('../controllers/b2b');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, b2bController.getB2BSpaces);
router.post('/', authenticateToken, b2bController.createB2BSpace);
router.put('/:id/status', authenticateToken, b2bController.updateB2BStatus);

module.exports = router;
