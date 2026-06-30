const prisma = require('../config/db');
const slugify = require('slugify');

const fmt = (c) => ({ ...c, _id: c.id, postCount: c._count?.blogs ?? 0 });

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { blogs: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, categories: cats.map(fmt) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/categories/:slug
const getCategory = async (req, res) => {
  try {
    const cat = await prisma.category.findFirst({
      where: { OR: [{ slug: req.params.slug }, { id: req.params.slug }] },
      include: { _count: { select: { blogs: true } } },
    });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ success: true, category: fmt(cat) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/categories (admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const slug = slugify(name, { lower: true, strict: true });
    const cat = await prisma.category.create({
      data: { name, slug, description: description || '', color: color || '#7c3aed', icon: icon || '📝' },
      include: { _count: { select: { blogs: true } } },
    });
    res.status(201).json({ success: true, category: fmt(cat) });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Category already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/categories/:id (admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const data = {};
    if (name) { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
    if (description !== undefined) data.description = description;
    if (color) data.color = color;
    if (icon)  data.icon  = icon;

    const cat = await prisma.category.update({
      where: { id: req.params.id },
      data,
      include: { _count: { select: { blogs: true } } },
    });
    res.json({ success: true, category: fmt(cat) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/categories/:id (admin)
const deleteCategory = async (req, res) => {
  try {
    // Prisma schema sets categoryId to null on delete (SetNull)
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Category not found' });
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
