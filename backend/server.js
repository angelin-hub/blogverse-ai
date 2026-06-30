require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://blogverse-ai.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts' },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/blogs',      require('./routes/blogs'));
app.use('/api/comments',   require('./routes/comments'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/ai',         require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BlogVerse AI API running', db: 'Neon PostgreSQL' });
});

// 404
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   BlogVerse AI Server Running      ║
  ║   Port: ${PORT}                       ║
  ║   DB:   Neon PostgreSQL            ║
  ║   Env:  ${(process.env.NODE_ENV || 'development').padEnd(15)}     ║
  ╚════════════════════════════════════╝
  `);
});

module.exports = app;
