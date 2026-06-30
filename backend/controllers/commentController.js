const prisma = require('../config/db');

const commentInclude = {
  author: { select: { id: true, name: true, avatar: true } },
  _count: { select: { likes: true } },
};

const fmt = (c) => ({ ...c, _id: c.id, likesCount: c._count?.likes ?? 0 });

// GET /api/comments/:blogId
const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    const top = await prisma.comment.findMany({
      where: { blogId, parentCommentId: null },
      include: {
        ...commentInclude,
        replies: { include: commentInclude, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.comment.count({ where: { blogId } });

    res.json({
      success: true,
      comments: top.map((c) => ({ ...fmt(c), replies: (c.replies || []).map(fmt) })),
      total,
    });
  } catch (err) {
    console.error('GetComments:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/comments/:blogId
const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentComment } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content required' });

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
        blogId,
        parentCommentId: parentComment || null,
      },
      include: commentInclude,
    });

    res.status(201).json({ success: true, comment: fmt(comment) });
  } catch (err) {
    console.error('AddComment:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' });

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/comments/:id/like
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId: id } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { userId_commentId: { userId, commentId: id } } });
    } else {
      await prisma.commentLike.create({ data: { userId, commentId: id } });
    }

    const count = await prisma.commentLike.count({ where: { commentId: id } });
    res.json({ success: true, liked: !existing, likesCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getComments, addComment, deleteComment, likeComment };
