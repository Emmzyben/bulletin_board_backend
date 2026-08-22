const { Vote, Post, sequelize } = require('../models');

// GET /api/votes  — return current user's votes
const getUserVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      where: { voter_email: req.user.email },
    });
    res.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
};

// PUT /api/posts/:id/vote  — cast or toggle a vote
const voteOnPost = async (req, res) => {
  const { id: post_id } = req.params;
  const { vote_type } = req.body; // 'up' or 'down'
  const voter_email = req.user.email;

  try {
    const post = await Post.findByPk(post_id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existing = await Vote.findOne({ where: { post_id, voter_email } });

    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (existing) {
      if (existing.vote_type === vote_type) {
        // Same vote — no-op (frontend already prevents this, but guard anyway)
        return res.json({ message: 'Already voted', post });
      }
      // Switching vote
      if (existing.vote_type === 'up') { upvoteDelta = -1; downvoteDelta = 1; }
      else { upvoteDelta = 1; downvoteDelta = -1; }
      await existing.update({ vote_type });
    } else {
      // New vote
      await Vote.create({ post_id, voter_email, vote_type });
      if (vote_type === 'up') upvoteDelta = 1;
      else downvoteDelta = 1;
    }

    await post.increment({ upvotes: upvoteDelta, downvotes: downvoteDelta, vote_score: upvoteDelta - downvoteDelta });
    await post.reload();

    res.json(post);
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to update vote' });
  }
};

module.exports = { getUserVotes, voteOnPost };
