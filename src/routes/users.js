const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', usersController.getAllUsers);
router.get('/:email', usersController.getUserProfile);
router.get('/:email/follow-status', authenticateToken, usersController.getFollowStatus);
router.post('/:email/follow', authenticateToken, usersController.followUser);
router.delete('/:email/follow', authenticateToken, usersController.unfollowUser);
router.post('/:email/report', authenticateToken, usersController.reportUser);
router.post('/:email/block', authenticateToken, usersController.blockUser);
router.put('/profile', authenticateToken, usersController.updateUserProfile);
router.put('/profile/password', authenticateToken, usersController.updatePassword);
router.delete('/profile', authenticateToken, usersController.deleteAccount);
router.post('/profile/communities/:id', authenticateToken, usersController.joinCommunity);
router.delete('/profile/communities/:id', authenticateToken, usersController.leaveCommunity);

module.exports = router;
