const { Comment, Post, User } = require('../models');

const getComments = async (req, res) => {
  try {
    const { post_id, author_email, limit } = req.query;
    let whereClause = {};
    if (post_id) whereClause.post_id = post_id;
    if (author_email) whereClause.author_email = author_email;
    
    const comments = await Comment.findAll({
      where: whereClause,
      order: [['createdAt', 'ASC']],
      limit: limit ? parseInt(limit, 10) : undefined,
      include: [{ model: User, as: 'author', attributes: ['avatar_url', 'full_name'], required: false }]
    });

    // Attach avatar_url and resolve full_name from joined User row
    const enriched = comments.map(c => {
      const plain = c.toJSON();
      return {
        ...plain,
        author_avatar_url: plain.author?.avatar_url || null,
        author_name: plain.author?.full_name || plain.author_name,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

const createComment = async (req, res) => {
  try {
    const { post_id, body, parent_id } = req.body;

    // Fetch the actual user to get their full_name and avatar
    const dbUser = await User.findByPk(req.user.email, { attributes: ['full_name', 'email', 'avatar_url'] });
    const authorName = dbUser?.full_name || req.user.email.split('@')[0];

    const comment = await Comment.create({
      post_id,
      parent_id: parent_id || null,
      body,
      author_email: req.user.email,
      author_name: authorName,
    });

    // Keep post's comment_count in sync
    await Post.increment({ comment_count: 1 }, { where: { id: post_id } });

    // Return with avatar info
    const result = comment.toJSON();
    result.author_avatar_url = dbUser?.avatar_url || null;

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author_email !== req.user.email) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Count this comment + all its children so we decrement accurately
    const childCount = await Comment.count({ where: { parent_id: id } });
    await Comment.destroy({ where: { id } }); // parent_id cascade handles children
    await Post.increment(
      { comment_count: -(1 + childCount) },
      { where: { id: comment.post_id } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = { getComments, createComment, deleteComment };
