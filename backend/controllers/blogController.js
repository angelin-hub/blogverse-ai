const prisma = require('../config/db');
const slugify = require('slugify');

const genSlug = async (title, excludeId = null) => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let n = 1;
  while (true) {
    const found = await prisma.blog.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
};

const calcReadTime = (html) => {
  const words = html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const blogInclude = {
  author: { select: { id: true, name: true, avatar: true, bio: true } },
  category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
  _count: { select: { likes: true, comments: true } },
};

const formatBlog = (blog) => ({
  ...blog,
  _id: blog.id,
  status: blog.status.toLowerCase(),
  likesCount: blog._count?.likes ?? 0,
  commentsCount: blog._count?.comments ?? 0,
  author: blog.author ? { ...blog.author, _id: blog.author.id } : null,
  category: blog.category ? { ...blog.category, _id: blog.category.id } : null,
});

// GET /api/blogs
const getBlogs = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const where = {};

    // Status — default published, admin can see all
    if (req.query.status) {
      where.status = req.query.status.toUpperCase();
    } else {
      where.status = 'PUBLISHED';
    }

    // Author filter
    if (req.query.author) where.authorId = req.query.author;

    // Category filter (slug or id)
    if (req.query.category) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ slug: req.query.category }, { id: req.query.category }] },
      });
      if (cat) where.categoryId = cat.id;
    }

    // Tag filter
    if (req.query.tag) {
      where.tags = { has: req.query.tag.toLowerCase() };
    }

    // Full-text search (PostgreSQL ILIKE)
    if (req.query.search) {
      where.OR = [
        { title:   { contains: req.query.search, mode: 'insensitive' } },
        { excerpt: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    // Sort
    let orderBy = { createdAt: 'desc' };
    const s = req.query.sort;
    if (s === '-views'      || s === 'popular') orderBy = { views:     'desc' };
    if (s === '-likesCount' || s === 'liked')   orderBy = { createdAt: 'desc' }; // approximate
    if (s === 'oldest')                          orderBy = { createdAt: 'asc'  };

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where, orderBy, skip, take: limit,
        include: blogInclude,
      }),
    ]);

    res.json({
      success: true,
      blogs: blogs.map(formatBlog),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GetBlogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/blogs/featured
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const blogs = await prisma.blog.findMany({
      where: { featured: true, status: 'PUBLISHED' },
      include: blogInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ success: true, blogs: blogs.map(formatBlog) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/blogs/id/:id  (for edit page — by id)
const getBlogById = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: blogInclude,
    });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ success: true, blog: formatBlog(blog) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/blogs/:slug
const getBlog = async (req, res) => {
  try {
    const blog = await prisma.blog.findFirst({
      where: { slug: req.params.slug },
      include: {
        ...blogInclude,
        author: {
          select: { id: true, name: true, avatar: true, bio: true, createdAt: true },
          include: { _count: { select: { followers: true } } },
        },
      },
    });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Increment views async (don't await)
    prisma.blog.update({ where: { id: blog.id }, data: { views: { increment: 1 } } }).catch(() => {});

    res.json({ success: true, blog: formatBlog(blog) });
  } catch (err) {
    console.error('GetBlog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status, featured } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: 'Title and content are required' });

    const slug = await genSlug(title);
    const readTime = calcReadTime(content);
    const autoExcerpt = excerpt || content.replace(/<[^>]*>/g, '').slice(0, 200);
    const tagArr = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim().toLowerCase()) : []);

    const blog = await prisma.blog.create({
      data: {
        title, content, slug, readTime,
        excerpt: autoExcerpt,
        coverImage: coverImage || '',
        authorId: req.user.id,
        categoryId: category || null,
        tags: tagArr,
        status: (status || 'draft').toUpperCase(),
        featured: featured || false,
      },
      include: blogInclude,
    });

    res.status(201).json({ success: true, blog: formatBlog(blog) });
  } catch (err) {
    console.error('CreateBlog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const existing = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Blog not found' });
    if (existing.authorId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' });

    const { title, content, excerpt, coverImage, category, tags, status, featured } = req.body;
    const data = {};

    if (title)    { data.title = title; data.slug = await genSlug(title, req.params.id); }
    if (content)  { data.content = content; data.readTime = calcReadTime(content); }
    if (excerpt  !== undefined) data.excerpt    = excerpt;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (category !== undefined)  data.categoryId = category || null;
    if (tags     !== undefined)  data.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim().toLowerCase());
    if (status)   data.status = status.toUpperCase();
    if (featured !== undefined && req.user.role === 'ADMIN') data.featured = featured;

    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data,
      include: blogInclude,
    });

    res.json({ success: true, blog: formatBlog(blog) });
  } catch (err) {
    console.error('UpdateBlog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.authorId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' });

    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/blogs/:id/like
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.blogLike.findUnique({
      where: { userId_blogId: { userId, blogId: id } },
    });

    if (existing) {
      await prisma.blogLike.delete({ where: { userId_blogId: { userId, blogId: id } } });
    } else {
      await prisma.blogLike.create({ data: { userId, blogId: id } });
    }

    const count = await prisma.blogLike.count({ where: { blogId: id } });
    res.json({ success: true, liked: !existing, likesCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBlogs, getBlog, getBlogById, getFeaturedBlogs, createBlog, updateBlog, deleteBlog, likeBlog };
