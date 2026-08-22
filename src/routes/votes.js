const express = require('express');
const router = express.Router();
const { getUserVotes } = require('../controllers/votes');
const { authenticateToken } = require('../middlewares/auth');

// GET /api/votes — get current user's votes
router.get('/', authenticateToken, getUserVotes);

module.exports = router;
