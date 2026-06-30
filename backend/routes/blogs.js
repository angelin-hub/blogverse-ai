const express = require('express');
const router = express.Router();
const {
  getBlogs, getBlog, getBlogById, getFeaturedBlogs,
  createBlog, updateBlog, deleteBlog, likeBlog,
} = require('../controllers/blogController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/',            getBlogs);
router.get('/featured',    getFeaturedBlogs);
router.get('/id/:id',      getBlogById);       // for EditBlog page
router.get('/:slug',       getBlog);
router.post('/',           protect, createBlog);
router.put('/:id',         protect, updateBlog);
router.delete('/:id',      protect, deleteBlog);
router.post('/:id/like',   protect, likeBlog);

module.exports = router;
