const express = require('express');
const router = express.Router();
const savedPostsController = require('../controllers/saved_posts');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, savedPostsController.getSavedPosts);
router.post('/', authenticateToken, savedPostsController.createSavedPost);
router.delete('/:post_id', authenticateToken, savedPostsController.deleteSavedPost);

module.exports = router;
