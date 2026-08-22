const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', commentsController.getComments);
router.post('/', authenticateToken, commentsController.createComment);
router.delete('/:id', authenticateToken, commentsController.deleteComment);

module.exports = router;
