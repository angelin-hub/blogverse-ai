const prisma = require('../config/db');

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBlogs, totalComments, totalCategories, viewsAgg] = await Promise.all([
      prisma.user.count(),
      prisma.blog.count(),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.blog.aggregate({ _sum: { views: true } }),
    ]);

    const [publishedBlogs, draftBlogs] = await Promise.all([
      prisma.blog.count({ where: { status: 'PUBLISHED' } }),
      prisma.blog.count({ where: { status: 'DRAFT' } }),
    ]);

    const blogsByCategory = await prisma.category.findMany({
      include: { _count: { select: { blogs: true } } },
      orderBy: { blogs: { _count: 'desc' } },
      take: 8,
    });

    res.json({
      success: true,
      totalUsers,
      totalBlogs,
      totalComments,
      totalCategories,
      publishedBlogs,
      draftBlogs,
      totalViews: viewsAgg._sum.views || 0,
      blogsByCategory: blogsByCategory.map((c) => ({ _id: c.name, count: c._count.blogs })),
    });
  } catch (err) {
    console.error('AdminStats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const where = {};
    if (req.query.search) {
      where.OR = [
        { name:  { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }
    if (req.query.role) where.role = req.query.role.toUpperCase();

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, avatar: true, role: true, banned: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      users: users.map((u) => ({ ...u, _id: u.id, role: u.role === 'ADMIN' ? 'admin' : 'user' })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot change your own role' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: role.toUpperCase() },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ success: true, message: `Role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getUsers, updateUserRole };
