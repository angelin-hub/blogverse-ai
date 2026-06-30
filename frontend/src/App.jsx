import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NavDock from './components/NavDock';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const Home        = lazy(() => import('./pages/Home'));
const Blogs       = lazy(() => import('./pages/Blogs'));
const BlogDetail  = lazy(() => import('./pages/BlogDetail'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const CreateBlog  = lazy(() => import('./pages/CreateBlog'));
const EditBlog    = lazy(() => import('./pages/EditBlog'));
const Profile     = lazy(() => import('./pages/Profile'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const AdminPanel  = lazy(() => import('./pages/AdminPanel'));
const Categories  = lazy(() => import('./pages/Categories'));

const AUTH_PATHS = ['/login', '/register'];

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF6EC' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(109,40,217,0.15)', borderTopColor: '#6D28D9' }} />
        <p className="text-sm font-medium" style={{ color: '#7C5FA8' }}>Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();
  const path = window.location.pathname;
  const isAuthPage = AUTH_PATHS.includes(path);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex" style={{ background: '#FDF6EC', color: '#1A0B2E' }}>

      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: {
          background: '#1E0D3A',
          border: '1px solid rgba(109,40,217,0.25)',
          color: '#F5ECD8',
          borderRadius: '14px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(30,13,58,0.4)',
        },
        success: { iconTheme: { primary: '#8B5CF6', secondary: '#1E0D3A' } },
        error:   { iconTheme: { primary: '#EF4444', secondary: '#1E0D3A' } },
      }} />

      {/* Floating NavDock — hide on auth pages */}
      {!isAuthPage && <NavDock />}

      {/* Main content — left padding to clear the dock */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: isAuthPage ? 0 : 88 }}>
        <main className="flex-1">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/blogs"       element={<Blogs />} />
              <Route path="/blog/:slug"  element={<BlogDetail />} />
              <Route path="/categories"  element={<Categories />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/register"    element={<Register />} />

              <Route path="/create"    element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
              <Route path="/edit/:id"  element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin"     element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ background: '#FDF6EC' }}>
                  <div>
                    <p className="text-8xl font-extrabold mb-4" style={{ fontFamily: '"Playfair Display",serif',
                      background: 'linear-gradient(135deg,#1A0B2E,#6D28D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      404
                    </p>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A0B2E' }}>Page not found</h2>
                    <p className="mb-6" style={{ color: '#7C5FA8' }}>The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>

        {!isAuthPage && <Footer />}
      </div>

      <AIChatbot />
    </div>
  );
}
