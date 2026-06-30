import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageSquare, FiTrash2, FiSend, FiCornerDownRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function CommentItem({ comment, onDelete, onLike, onReply, depth = 0 }) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user && comment.author?._id === user._id;
  const isLiked = user && comment.likes?.includes(user._id);
  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : '';

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment._id, replyText.trim());
    setReplyText('');
    setShowReplyForm(false);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${depth > 0 ? 'ml-8 sm:ml-12 border-l-2 border-violet-200 dark:border-violet-800/40 pl-4' : ''}`}
    >
      <div className="flex gap-3">
        <Link to={`/profile/${comment.author?._id}`} className="flex-shrink-0">
          <img
            src={
              comment.author?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'U')}&background=7c3aed&color=fff`
            }
            alt={comment.author?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/profile/${comment.author?._id}`}
                className="font-semibold text-gray-900 dark:text-white text-sm hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {comment.author?.name || 'Anonymous'}
              </Link>
              <span className="text-gray-400 dark:text-gray-500 text-xs">{timeAgo}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5 px-2">
            <button
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isLiked
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <FiHeart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {comment.likes?.length || 0}
            </button>

            {depth === 0 && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-violet-500 transition-colors"
              >
                <FiCornerDownRight className="w-3.5 h-3.5" />
                Reply
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => onDelete(comment._id)}
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReplySubmit}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author?.name}...`}
                  className="flex-1 input-field text-sm py-2"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="px-3 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onDelete={onDelete}
              onLike={onLike}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function CommentSection({ blogId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/comments/${blogId}`);
        setComments(data.comments || []);
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/comments/${blogId}`, { content: newComment.trim() });
      setComments((prev) => [{ ...data.comment, replies: [] }, ...prev]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) =>
        prev
          .filter((c) => c._id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r._id !== commentId) || [],
          }))
      );
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like');
      return;
    }
    try {
      const { data } = await api.post(`/comments/${commentId}/like`);
      const updateLikes = (comments) =>
        comments.map((c) => {
          if (c._id === commentId) {
            const likes = data.liked
              ? [...(c.likes || []), user._id]
              : (c.likes || []).filter((id) => id !== user._id);
            return { ...c, likes };
          }
          if (c.replies) {
            return { ...c, replies: updateLikes(c.replies) };
          }
          return c;
        });
      setComments(updateLikes);
    } catch {
      toast.error('Failed to like comment');
    }
  };

  const handleReply = async (parentId, content) => {
    if (!isAuthenticated) {
      toast.error('Please login to reply');
      return;
    }
    try {
      const { data } = await api.post(`/comments/${blogId}`, {
        content,
        parentComment: parentId,
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), data.comment] }
            : c
        )
      );
      toast.success('Reply added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add reply');
    }
  };

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <FiMessageSquare className="text-violet-500" />
        Comments
        <span className="text-base font-normal text-gray-500 dark:text-gray-400">
          ({comments.length})
        </span>
      </h3>

      {/* Add comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=7c3aed&color=fff`
            }
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-1"
          />
          <div className="flex-1 flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={2}
              className="flex-1 input-field resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSubmit(e);
              }}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="self-end px-4 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl hover:from-violet-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Post</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-200 dark:border-violet-700/30 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <Link to="/login" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
              Sign in
            </Link>{' '}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-16 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <FiMessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onDelete={handleDelete}
                onLike={handleLike}
                onReply={handleReply}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </section>
  );
}
