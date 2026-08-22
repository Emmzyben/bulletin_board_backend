const { SavedPost } = require('../models');

const getSavedPosts = async (req, res) => {
  try {
    const { user_email } = req.query;
    let whereClause = {};
    if (user_email) whereClause.user_email = user_email;
    
    const savedPosts = await SavedPost.findAll({
      where: whereClause
    });
    res.json(savedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
};

const createSavedPost = async (req, res) => {
  try {
    const { post_id } = req.body;
    const savedPost = await SavedPost.create({
      post_id,
      user_email: req.user.email
    });
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save post' });
  }
};

const deleteSavedPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    await SavedPost.destroy({
      where: {
        post_id,
        user_email: req.user.email
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove saved post' });
  }
};

module.exports = { getSavedPosts, createSavedPost, deleteSavedPost };
