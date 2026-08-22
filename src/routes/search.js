const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

// Note: Search endpoints are generally public or use a different form of rate limiting/auth
router.get('/posts', searchController.searchPosts);
router.get('/users', searchController.searchUsers);

module.exports = router;
