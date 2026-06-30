# BlogVerse AI 🚀✨

A **full-stack AI-powered blogging platform** built with React, Node.js, MongoDB, and OpenAI. Write better, discover faster, and connect with a global community of thinkers.

![BlogVerse AI](https://picsum.photos/seed/blogverse/1200/400)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Auth** | Register, login, secure protected routes |
| 📝 **Blog CRUD** | Create, edit, publish, delete blogs with rich text editor |
| 💬 **Comments** | Nested comments with likes |
| ❤️ **Likes** | Toggle likes on blogs and comments |
| 🔍 **Search** | Full-text search across blogs |
| 🗂️ **Categories** | Organize blogs by category with color & emoji |
| 👤 **User Profiles** | Follow/unfollow, view posts, stats |
| 📊 **Dashboard** | Manage posts, view stats, edit profile |
| 🛡️ **Admin Panel** | Manage users, blogs, categories; site-wide stats |
| 🤖 **AI Chatbot** | Generate ideas, suggest titles, improve writing via OpenAI |
| 🌙 **Dark / Light Mode** | Persistent theme toggle |
| 📱 **Fully Responsive** | Mobile-first design |
| 💎 **Glassmorphism UI** | Premium SaaS aesthetic with gradients & animations |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS + custom glassmorphism utilities
- Framer Motion (animations)
- React Router v6
- React Quill (rich text editor)
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- OpenAI API (GPT)
- Helmet, CORS, Rate Limiting

---

## 📁 Project Structure

```
blogverse-ai/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, upload middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── server.js       # Entry point
│   └── .env.example
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Navbar, Footer, BlogCard, AIChatbot...
        ├── context/    # AuthContext, ThemeContext
        ├── hooks/      # useBlogs, useAuth
        ├── pages/      # All page components
        ├── utils/      # Axios instance
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)

### 1. Clone & Install

```bash
# Backend
cd blogverse-ai/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# backend/.env
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogverse
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...your-openai-key...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Update password |

### Blogs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs` | Get all blogs (paginated, filterable) |
| GET | `/api/blogs/featured` | Get featured blogs |
| GET | `/api/blogs/:slug` | Get single blog (increments views) |
| POST | `/api/blogs` | Create blog (auth required) |
| PUT | `/api/blogs/:id` | Update blog (author/admin) |
| DELETE | `/api/blogs/:id` | Delete blog (author/admin) |
| POST | `/api/blogs/:id/like` | Toggle like (auth required) |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/:blogId` | Get comments for a blog |
| POST | `/api/comments` | Add comment (auth required) |
| DELETE | `/api/comments/:id` | Delete comment |
| POST | `/api/comments/:id/like` | Toggle comment like |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update own profile |
| POST | `/api/users/:id/follow` | Follow user |
| POST | `/api/users/:id/unfollow` | Unfollow user |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/generate-ideas` | Generate blog ideas |
| POST | `/api/ai/suggest-titles` | Suggest titles |
| POST | `/api/ai/summarize` | Summarize blog content |
| POST | `/api/ai/writing-assistant` | Improve/continue writing |

### Admin (admin role required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Set user role |

---

## 🤖 AI Features

The AI Chatbot (floating button, bottom-right) uses the OpenAI API:

- **💡 Generate Ideas** — Get 5 creative blog ideas based on a topic
- **✏️ Suggest Titles** — Generate catchy titles for your content
- **🪄 Improve Writing** — Get suggestions to enhance your writing
- **📋 Summarize** — Summarize existing blog content
- **💬 Free Chat** — Ask anything writing-related

> **Note:** Set `OPENAI_API_KEY` in your `.env` file. Without it, AI features will show an error.

---

## 🎨 UI Highlights

- **Glassmorphism** cards with `backdrop-blur` throughout
- **Animated gradient** hero section with floating blobs
- **Dark mode** — every component has full dark variants
- **Framer Motion** — page transitions, card hover effects, chatbot animations
- **Mobile-first** — responsive at all breakpoints

---

## 🏗️ Building for Production

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Start backend in production
cd backend
NODE_ENV=production npm start
```

### Serve static files with Express (optional)

Add to `backend/server.js`:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
```

---

## 📝 Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | Secret for signing JWTs | ✅ Yes |
| `JWT_EXPIRE` | JWT expiry duration | No (default: 7d) |
| `OPENAI_API_KEY` | OpenAI API key for AI features | For AI |
| `CLIENT_URL` | Frontend URL for CORS | No |
| `NODE_ENV` | Environment mode | No |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Built with ♥ using React, Node.js & OpenAI<br/>
  <strong>BlogVerse AI</strong> — Where stories come alive
</p>
