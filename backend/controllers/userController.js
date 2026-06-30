const prisma = require('../config/db');

const safeUser = (u, extra = {}) => ({
  _id: u.id, id: u.id,
  name: u.name, email: u.email,
  avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6D28D9&color=fff`,
  bio: u.bio || '',
  website:  u.website  || '',
  linkedin: u.linkedin || '',
  github:   u.github   || '',
  twitter:  u.twitter  || '',
  location: u.location || '',
  role: u.role === 'ADMIN' ? 'admin' : 'user',
  createdAt: u.createdAt, ...extra,
});

// GET /api/users/:id
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { followers: true, following: true, blogs: true } },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hydrate followers/following arrays as simple ids for frontend compatibility
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      select: { followerId: true },
    });
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    res.json({
      success: true,
      user: safeUser(user, {
        followers: followers.map((f) => f.followerId),
        following: following.map((f) => f.followingId),
        blogCount: user._count.blogs,
      }),
    });
  } catch (err) {
    console.error('GetProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar, website, linkedin, github, twitter, location } = req.body;
    const data = {};
    if (name     !== undefined && name.trim()) data.name     = name.trim();
    if (bio      !== undefined) data.bio      = bio;
    if (avatar   !== undefined) data.avatar   = avatar;
    if (website  !== undefined) data.website  = website;
    if (linkedin !== undefined) data.linkedin = linkedin;
    if (github   !== undefined) data.github   = github;
    if (twitter  !== undefined) data.twitter  = twitter;
    if (location !== undefined) data.location = location;

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    console.error('UpdateProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/:id/follow
const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Cannot follow yourself' });

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.user.id, followingId: req.params.id } },
      update: {},
      create: { followerId: req.user.id, followingId: req.params.id },
    });
    res.json({ success: true, message: 'Followed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/:id/unfollow
const unfollowUser = async (req, res) => {
  try {
    await prisma.follow.deleteMany({
      where: { followerId: req.user.id, followingId: req.params.id },
    });
    res.json({ success: true, message: 'Unfollowed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/:id/liked
const getLikedBlogs = async (req, res) => {
  try {
    const likes = await prisma.blogLike.findMany({
      where: { userId: req.params.id },
      include: {
        blog: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const blogs = likes.map((l) => ({
      ...l.blog,
      _id: l.blog.id,
      status: l.blog.status.toLowerCase(),
      likesCount: l.blog._count.likes,
    }));

    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, followUser, unfollowUser, getLikedBlogs };
