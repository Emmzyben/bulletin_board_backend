const { Post, User } = require('../models');
const { Op } = require('sequelize');

const searchPosts = async (req, res) => {
  try {
    const query = req.query.q || '';
    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { body: { [Op.like]: `%${query}%` } },
          { author_name: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 4
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

module.exports = { searchPosts, searchUsers };
