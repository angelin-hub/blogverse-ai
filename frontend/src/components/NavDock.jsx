import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Icons
import {
  FiHome, FiBookOpen, FiGrid, FiPenTool, FiLayout,
  FiShield, FiLogOut, FiUser, FiSettings, FiChevronRight,
  FiSearch, FiX,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { BsRobot } from 'react-icons/bs';

/* ─── Floating particles ─── */
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1.5,
  x: Math.random() * 80 + 10,
  y: Math.random() * 80 + 10,
  dur: Math.random() * 4 + 3,
  delay: Math.random() * 3,
}));

/* ─── Nav items ─── */
const TOP_NAV = [
  { to: '/',           icon: FiHome,      label: 'Home',       end: true },
  { to: '/blogs',      icon: FiBookOpen,  label: 'Blogs' },
  { to: '/categories', icon: FiGrid,      label: 'Categories' },
];

const AUTH_NAV = [
  { to: '/create',    icon: FiPenTool,  label: 'Write' },
  { to: '/dashboard', icon: FiLayout,   label: 'Dashboard' },
];

/* ─── Tooltip ─── */
function Tooltip({ label, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -8, scale: 0.9 }}
          animate={{ opacity: 1, x: 0,  scale: 1 }}
          exit={{    opacity: 0, x: -8, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="absolute left-full ml-3 z-50 pointer-events-none"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <div className="px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap"
            style={{
              background: '#1E0D3A',
              color: '#F5ECD8',
              border: '1px solid rgba(109,40,217,0.35)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            }}
          >
            {label}
          </div>
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-px"
            style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #1E0D3A' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Nav item button ─── */
function NavItem({ to, icon: Icon, label, end = false, expanded, onClick }) {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <NavLink to={to} onClick={onClick}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-3 rounded-2xl transition-all overflow-hidden"
          style={{
            padding: expanded ? '0.7rem 1rem' : '0.7rem',
            background: isActive
              ? 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(139,92,246,0.3))'
              : hovered
              ? 'rgba(109,40,217,0.15)'
              : 'transparent',
            border: isActive ? '1px solid rgba(109,40,217,0.45)' : '1px solid transparent',
          }}
        >
          {/* Active glow */}
          {isActive && (
            <motion.div
              layoutId="activeGlow"
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.18),rgba(139,92,246,0.08))', boxShadow: 'inset 0 0 20px rgba(109,40,217,0.2)' }}
            />
          )}

          {/* Active left indicator */}
          {isActive && (
            <motion.div
              layoutId="activePill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
              style={{ height: 20, background: 'linear-gradient(180deg,#8B5CF6,#6D28D9)' }}
            />
          )}

          {/* Icon */}
          <div className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <Icon
              className="w-5 h-5"
              style={{ color: isActive ? '#C4B5FD' : hovered ? '#A78BFA' : 'rgba(245,236,216,0.55)' }}
            />
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ background: 'rgba(139,92,246,0.4)' }}
              />
            )}
          </div>

          {/* Label */}
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                style={{ color: isActive ? '#F5ECD8' : 'rgba(245,236,216,0.65)' }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </NavLink>

      {/* Tooltip (only when collapsed) */}
      {!expanded && <Tooltip label={label} visible={hovered} />}
    </div>
  );
}

/* ─── Main NavDock ─── */
export default function NavDock() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded,     setExpanded]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const hoverTimer = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setExpanded(true), 120);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => { setExpanded(false); setProfileOpen(false); }, 250);
  };

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const dockWidth = expanded ? 220 : 68;

  return (
    <>
      {/* ── Dock ── */}
      <motion.nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{ width: dockWidth }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="fixed left-4 top-1/2 z-40 flex flex-col"
        style={{
          transform: 'translateY(-50%)',
          height: 'auto',
          maxHeight: '90vh',
          background: 'rgba(15, 5, 28, 0.82)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(109,40,217,0.25)',
          borderRadius: 28,
          boxShadow: '0 8px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(109,40,217,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          padding: '1rem 0.85rem',
          overflow: 'visible',
        }}
      >
        {/* Floating particles inside dock */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {PARTICLES.map(p => (
            <motion.div key={p.id}
              animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, background: 'rgba(139,92,246,0.5)' }}
            />
          ))}
          {/* Gradient glow inside */}
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.20) 0%, transparent 70%)' }} />
        </div>

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 mb-6 px-1 relative">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow: '0 0 20px rgba(109,40,217,0.55)' }}
          >
            <HiSparkles className="w-5 h-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-extrabold text-base whitespace-nowrap"
                style={{ fontFamily: '"Playfair Display",serif', color: '#F5ECD8' }}
              >
                BlogVerse <span style={{ color: '#A78BFA' }}>AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Divider ── */}
        <div className="mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginLeft: -2, marginRight: -2 }} />

        {/* ── Top nav ── */}
        <div className="flex flex-col gap-1 mb-3">
          {TOP_NAV.map(item => (
            <NavItem key={item.to} {...item} expanded={expanded} />
          ))}
        </div>

        {/* ── Divider ── */}
        {isAuthenticated && (
          <div className="my-2" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
        )}

        {/* ── Auth nav ── */}
        {isAuthenticated && (
          <div className="flex flex-col gap-1 mb-3">
            {AUTH_NAV.map(item => (
              <NavItem key={item.to} {...item} expanded={expanded} />
            ))}
            {isAdmin && (
              <NavItem to="/admin" icon={FiShield} label="Admin" expanded={expanded} />
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" style={{ minHeight: 12 }} />

        {/* ── Divider ── */}
        <div className="mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

        {/* ── Bottom section ── */}
        <div className="flex flex-col gap-1">
          {isAuthenticated ? (
            <>
              {/* Profile button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-3 w-full rounded-2xl transition-all"
                  style={{ padding: expanded ? '0.55rem 0.75rem' : '0.55rem', background: profileOpen ? 'rgba(109,40,217,0.25)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,40,217,0.15)'}
                  onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent'; }}
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=2A1250&color=F5ECD8`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                    style={{ border: '1.5px solid rgba(109,40,217,0.45)' }}
                  />
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: '#F5ECD8' }}>{user?.name}</p>
                          <p className="text-xs truncate" style={{ color: 'rgba(245,236,216,0.35)', fontSize: '0.65rem' }}>{user?.email}</p>
                        </div>
                        <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(245,236,216,0.3)', transform: profileOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Profile popup */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: -10 }}
                      animate={{ opacity: 1, scale: 1,   x: 0 }}
                      exit={{    opacity: 0, scale: 0.9, x: -10 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      className="absolute bottom-full left-full ml-3 mb-0 w-48 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: '#1A0B2E',
                        border: '1px solid rgba(109,40,217,0.3)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
                        bottom: 0,
                      }}
                    >
                      <div className="p-3 border-b border-white/[0.06]"
                        style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.3),rgba(26,11,46,0.8))' }}>
                        <p className="text-xs font-bold" style={{ color: '#F5ECD8', fontFamily: '"Playfair Display",serif' }}>{user?.name}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,236,216,0.4)' }}>{user?.email}</p>
                      </div>
                      {[
                        { to: `/profile/${user?._id}`, icon: <FiUser className="w-3.5 h-3.5"/>,     label: 'Profile' },
                        { to: '/dashboard',            icon: <FiLayout className="w-3.5 h-3.5"/>,   label: 'Dashboard' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-all"
                          style={{ color: 'rgba(245,236,216,0.7)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.25)'; e.currentTarget.style.color = '#F5ECD8'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(245,236,216,0.7)'; }}
                        >
                          <span style={{ color: '#A78BFA' }}>{item.icon}</span> {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button onClick={() => { handleLogout(); setProfileOpen(false); }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-medium transition-all"
                          style={{ color: '#F87171' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <FiLogOut className="w-3.5 h-3.5"/> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <NavItem to="/login"    icon={FiUser}     label="Login"    expanded={expanded} />
              <NavItem to="/register" icon={FiSettings} label="Register" expanded={expanded} />
            </div>
          )}
        </div>

        {/* Expand toggle hint */}
        <motion.div
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: '#1E0D3A', border: '1px solid rgba(109,40,217,0.35)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          animate={{ opacity: expanded ? 0 : [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FiChevronRight className="w-3 h-3" style={{ color: '#A78BFA' }} />
        </motion.div>
      </motion.nav>

      {/* ── Search overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl overflow-hidden"
              style={{ background: '#1E0D3A', border: '1px solid rgba(109,40,217,0.35)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-center gap-3 p-4">
                <FiSearch className="w-5 h-5 flex-shrink-0" style={{ color: '#A78BFA' }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(`/blogs?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); } if (e.key === 'Escape') setSearchOpen(false); }}
                  placeholder="Search articles, topics..."
                  className="flex-1 bg-transparent outline-none text-base"
                  style={{ color: '#F5ECD8' }}
                />
                <button onClick={() => setSearchOpen(false)} style={{ color: 'rgba(245,236,216,0.4)' }}>
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
