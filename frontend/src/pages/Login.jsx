import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form,     setForm]     = useState({ email:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! ✨');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    /* ── Cream page background ── */
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #FDF6EC 0%, #F5ECD8 50%, #EEE0C8 100%)' }}
    >
      {/* Subtle background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'rgba(109,40,217,0.06)', filter:'blur(80px)', transform:'translate(30%,-30%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background:'rgba(109,40,217,0.05)', filter:'blur(70px)', transform:'translate(-30%,30%)' }} />

      <motion.div
        initial={{ opacity:0, y:28, scale:0.97 }}
        animate={{ opacity:1, y:0,  scale:1 }}
        transition={{ duration:0.5, type:'spring', stiffness:200, damping:24 }}
        className="w-full max-w-md relative z-10"
      >
        {/* ── Dark violet card with LEFT accent bar ── */}
        <div className="flex rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 24px 80px rgba(30,13,58,0.25), 0 0 0 1px rgba(109,40,217,0.12)' }}
        >
          {/* LEFT SIDE BAR */}
          <div className="w-1.5 flex-shrink-0"
            style={{ background:'linear-gradient(180deg, #6D28D9 0%, #A78BFA 50%, #6D28D9 100%)' }}
          />

          {/* Card body — dark violet */}
          <div className="flex-1 p-8"
            style={{ background:'#1E0D3A' }}
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
                <motion.div whileHover={{ rotate:16, scale:1.1 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow:'0 6px 24px rgba(109,40,217,0.5)' }}>
                  <HiSparkles className="w-6 h-6" style={{ color:'#F5ECD8' }} />
                </motion.div>
                <span className="font-extrabold text-2xl" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                  BlogVerse <span style={{ color:'#A78BFA' }}>AI</span>
                </span>
              </Link>
              <h1 className="text-2xl font-bold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                Welcome back
              </h1>
              <p className="text-sm mt-1" style={{ color:'rgba(245,236,216,0.45)' }}>
                Sign in to continue your writing journey
              </p>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { icon:<FaGoogle className="text-red-400"/>, label:'Google' },
                { icon:<FaGithub style={{color:'#F5ECD8'}}/>,  label:'GitHub' },
              ].map(s => (
                <button key={s.label} type="button"
                  onClick={() => toast('Coming soon! 🔧')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(245,236,216,0.8)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(109,40,217,0.25)'; e.currentTarget.style.borderColor='rgba(109,40,217,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.08)' }} />
              <span className="text-xs" style={{ color:'rgba(245,236,216,0.3)' }}>or continue with email</span>
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:'rgba(245,236,216,0.75)' }}>
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'rgba(245,236,216,0.3)' }} />
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" autoComplete="email"
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-semibold" style={{ color:'rgba(245,236,216,0.75)' }}>Password</label>
                  <a href="#" className="text-xs font-medium" style={{ color:'#A78BFA' }}>Forgot password?</a>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'rgba(245,236,216,0.3)' }} />
                  <input name="password" type={showPass?'text':'password'} value={form.password} onChange={handleChange}
                    placeholder="••••••••" autoComplete="current-password"
                    className="input-dark pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(v=>!v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color:'rgba(245,236,216,0.3)' }}
                    onMouseEnter={e => e.currentTarget.style.color='#A78BFA'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(245,236,216,0.3)'}
                  >
                    {showPass ? <FiEyeOff className="w-4 h-4"/> : <FiEye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-2 transition-all"
                style={{
                  background: loading ? 'rgba(109,40,217,0.4)' : 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
                  color:'#F5ECD8',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(109,40,217,0.5)',
                  border:'1px solid rgba(167,139,250,0.2)',
                }}
              >
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-cream/30 border-t-white animate-spin"/> Signing in...</>
                  : <>Sign In <FiArrowRight/></>
                }
              </motion.button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color:'rgba(245,236,216,0.35)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color:'#A78BFA' }}>
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
