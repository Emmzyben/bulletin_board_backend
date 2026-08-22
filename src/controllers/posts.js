const { Post, User, Comment } = require('../models');
const { sequelize: db } = require('../config/db');

const getPosts = async (req, res) => {
  try {
    const { author_email, ids, limit } = req.query;
    let whereClause = {};
    if (author_email) {
      whereClause.author_email = author_email;
    }
    if (ids) {
      whereClause.id = ids.split(',');
    }

    const posts = await Post.findAll({
      where: whereClause,
      attributes: {
        include: [
          [
            db.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = post.id)'),
            'comment_count'
          ]
        ]
      },
      include: [{ model: User, as: 'author', attributes: ['email', 'role', 'avatar_url', 'full_name'] }],
      order: [['createdAt', 'DESC']],
      limit: limit ? parseInt(limit, 10) : undefined
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, body, flair, ecosystem, image_url, poll_options } = req.body;

    const dbUser = await User.findByPk(req.user.email, { attributes: ['full_name'] });
    const authorName = dbUser?.full_name || req.user.email.split('@')[0];

    const newPost = await Post.create({
      title,
      body,
      flair,
      ecosystem,
      image_url,
      author_email: req.user.email,
      author_name: authorName,
      poll_options: poll_options || null,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getPosts, createPost };
