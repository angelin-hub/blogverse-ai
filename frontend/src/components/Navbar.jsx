import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiPenTool, FiShield, FiLayout, FiBookOpen } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const NAV_LINKS = [
  { to: '/',           label: 'Home',       end: true },
  { to: '/blogs',      label: 'Blogs' },
  { to: '/categories', label: 'Categories' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); setDropOpen(false); setMenuOpen(false); navigate('/'); };

  return (
    <header className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(253,246,236,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(109,40,217,0.10)',
        boxShadow: '0 2px 20px rgba(109,40,217,0.07)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <motion.div whileHover={{ rotate: 18, scale: 1.08 }} transition={{ type:'spring', stiffness:400 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow:'0 4px 14px rgba(109,40,217,0.4)' }}>
            <HiSparkles className="w-5 h-5" style={{ color:'#F5ECD8' }} />
          </motion.div>
          <span className="font-extrabold text-xl tracking-tight"
            style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
            BlogVerse <span style={{ color:'#6D28D9' }}>AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? '' : 'nav-link'}`
                }
                style={({ isActive }) => isActive
                  ? { background:'rgba(109,40,217,0.10)', color:'#6D28D9', fontWeight:600, border:'1px solid rgba(109,40,217,0.18)' }
                  : {}
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/create"
                className="hidden sm:flex items-center gap-1.5 btn-primary text-sm py-2 px-4">
                <FiPenTool className="w-3.5 h-3.5" /> Write
              </Link>

              <div ref={dropRef} className="relative">
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => setDropOpen(v=>!v)}
                  className="flex items-center p-0.5 rounded-full"
                  style={{ border:'2px solid rgba(109,40,217,0.35)' }}
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=6D28D9&color=F5ECD8`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </motion.button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity:0, scale:0.92, y:-8 }}
                      animate={{ opacity:1, scale:1,    y:0  }}
                      exit={{    opacity:0, scale:0.92, y:-8 }}
                      transition={{ duration:0.18, type:'spring', stiffness:400, damping:28 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden origin-top-right"
                      style={{ background:'#1E0D3A', boxShadow:'0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.07)' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                        <p className="font-semibold text-sm truncate" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>{user?.name}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color:'rgba(245,236,216,0.4)' }}>{user?.email}</p>
                      </div>
                      {[
                        { to:`/profile/${user?._id}`, icon:<FiUser     className="w-4 h-4"/>, label:'Profile'     },
                        { to:'/dashboard',            icon:<FiLayout   className="w-4 h-4"/>, label:'Dashboard'   },
                        { to:'/create',               icon:<FiPenTool  className="w-4 h-4"/>, label:'Write Blog'  },
                        ...(isAdmin?[{ to:'/admin',   icon:<FiShield   className="w-4 h-4"/>, label:'Admin Panel' }]:[]),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all"
                          style={{ color:'rgba(245,236,216,0.7)' }}
                          onMouseEnter={e => { e.currentTarget.style.background='rgba(109,40,217,0.25)'; e.currentTarget.style.color='#F5ECD8'; }}
                          onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(245,236,216,0.7)'; }}
                        >
                          <span style={{ color:'#A78BFA' }}>{item.icon}</span> {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-all"
                          style={{ color:'#F87171' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background=''}
                        >
                          <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get Started</Link>
            </div>
          )}

          <button onClick={() => setMenuOpen(v=>!v)}
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ background:'rgba(109,40,217,0.08)', color:'#4B3068', border:'1px solid rgba(109,40,217,0.12)' }}
          >
            {menuOpen ? <FiX className="w-5 h-5"/> : <FiMenu className="w-5 h-5"/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:'auto' }}
            exit={{    opacity:0, height:0 }}
            transition={{ duration:0.25 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop:'1px solid rgba(109,40,217,0.10)', background:'rgba(253,246,236,0.97)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <NavLink key={link.to} to={link.to} end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(109,40,217,0.10)' : '',
                    color: isActive ? '#6D28D9' : '#4B3068',
                  })}
                >
                  <FiBookOpen className="w-4 h-4"/> {link.label}
                </NavLink>
              ))}
              <div className="pt-2 space-y-1.5" style={{ borderTop:'1px solid rgba(109,40,217,0.10)' }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/create"    onClick={()=>setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ color:'#4B3068' }}><FiPenTool/> Write Blog</Link>
                    <Link to="/dashboard" onClick={()=>setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ color:'#4B3068' }}><FiLayout/> Dashboard</Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium" style={{ color:'#EF4444' }}><FiLogOut/> Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"    onClick={()=>setMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl text-sm font-semibold btn-secondary">Login</Link>
                    <Link to="/register" onClick={()=>setMenuOpen(false)} className="block btn-primary text-sm text-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
