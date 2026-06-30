const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, followUser, unfollowUser, getLikedBlogs } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id',           getProfile);
router.get('/:id/liked',     getLikedBlogs);
router.put('/profile',       protect, updateProfile);
router.post('/:id/follow',   protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;
