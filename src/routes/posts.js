const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const { voteOnPost } = require('../controllers/votes');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', postsController.getPosts);
router.post('/', authenticateToken, postsController.createPost);
router.put('/:id/vote', authenticateToken, voteOnPost);

module.exports = router;
