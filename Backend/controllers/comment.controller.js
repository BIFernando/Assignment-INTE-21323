const { Comment, User } = require('../models/index');

// ── ADD COMMENT ────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const comment = await Comment.create({
      taskId: taskId,
      userId: req.user.id,
      content: content.trim(),
    });

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: comment,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── GET COMMENTS FOR A TASK ────────────────────────────
const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.findAll({
      where: { taskId },
      include: [{
        model: User,
        as: 'author',           // ← add this, matches your association
        attributes: ['id', 'name', 'email'],
      }],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error('getComments error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── DELETE COMMENT ─────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

module.exports = { addComment, getComments, deleteComment };