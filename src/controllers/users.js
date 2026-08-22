const { User, Follow } = require('../models');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const updates = req.body;
    await User.update(updates, { where: { email } });
    const user = await User.findOne({ where: { email } });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

const getFollowStatus = async (req, res) => {
  try {
    const followerEmail = req.user.email;
    const followingEmail = req.params.email;
    if (!followingEmail) return res.status(400).json({ error: 'Target email is required' });
    const follow = await Follow.findOne({ where: { follower_email: followerEmail, following_email: followingEmail } });
    res.json({ is_following: !!follow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch follow status' });
  }
};

const followUser = async (req, res) => {
  try {
    const followerEmail = req.user.email;
    const followingEmail = req.params.email;
    if (!followingEmail) return res.status(400).json({ error: 'Target email is required' });
    if (followerEmail === followingEmail) return res.status(400).json({ error: 'Cannot follow yourself' });

    const targetUser = await User.findOne({ where: { email: followingEmail } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const [follow, created] = await Follow.findOrCreate({
      where: { follower_email: followerEmail, following_email: followingEmail },
      defaults: { follower_email: followerEmail, following_email: followingEmail }
    });

    if (created) {
      await User.increment({ followers_count: 1 }, { where: { email: followingEmail } });
      await User.increment({ following_count: 1 }, { where: { email: followerEmail } });
    }

    res.json({ success: true, following: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const followerEmail = req.user.email;
    const followingEmail = req.params.email;
    if (!followingEmail) return res.status(400).json({ error: 'Target email is required' });
    if (followerEmail === followingEmail) return res.status(400).json({ error: 'Cannot unfollow yourself' });

    const deleted = await Follow.destroy({ where: { follower_email: followerEmail, following_email: followingEmail } });
    if (deleted) {
      await User.decrement({ followers_count: 1 }, { where: { email: followingEmail } });
      await User.decrement({ following_count: 1 }, { where: { email: followerEmail } });
    }

    res.json({ success: true, following: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

const reportUser = async (req, res) => {
  try {
    // In a real app, you would log the report to a database table or send an email to admins.
    // For now, we simulate a successful report.
    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

const blockUser = async (req, res) => {
  try {
    // In a real app, you would add a block record to a database table to prevent interactions.
    // For now, we simulate a successful block.
    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { email } });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hard delete the user. Associations (posts, comments, etc.) should have CASCADE deletes in the DB.
    await user.destroy();
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

const parseCommunities = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

const joinCommunity = async (req, res) => {
  try {
    const email = req.user.email;
    const { id } = req.params;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const currentCommunities = parseCommunities(user.joined_communities);
    if (!currentCommunities.includes(id)) {
      currentCommunities.push(id);
      await User.update({ joined_communities: currentCommunities }, { where: { email } });
    }

    res.json({ success: true, joined_communities: currentCommunities });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
};

const leaveCommunity = async (req, res) => {
  try {
    const email = req.user.email;
    const { id } = req.params;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let currentCommunities = parseCommunities(user.joined_communities).filter(c => c !== id);
    await User.update({ joined_communities: currentCommunities }, { where: { email } });

    res.json({ success: true, joined_communities: currentCommunities });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
};

module.exports = { getAllUsers, getUserProfile, updateUserProfile, getFollowStatus, followUser, unfollowUser, reportUser, blockUser, updatePassword, deleteAccount, joinCommunity, leaveCommunity };
