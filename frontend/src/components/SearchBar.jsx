import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock } from 'react-icons/fi';
import api from '../utils/api';

export default function SearchBar({ onSearch }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recent,  setRecent]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('bv_searches')||'[]'); } catch { return []; }
  });
  const debounce = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) { setResults([]); onSearch?.(''); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/blogs', { params:{ search:query, limit:6, status:'published' } });
        setResults(data.blogs||[]);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [query]);

  const saveRecent = t => {
    const u = [t, ...recent.filter(s=>s!==t)].slice(0,5);
    setRecent(u); localStorage.setItem('bv_searches', JSON.stringify(u));
  };

  const handleSelect = (slug, title) => { saveRecent(title); navigate(`/blog/${slug}`); setQuery(''); setFocused(false); };
  const handleSubmit = e => { e.preventDefault(); if(!query.trim()) return; saveRecent(query); onSearch?.(query); setFocused(false); };

  const showDrop = focused && (results.length>0 || loading || (!query && recent.length>0));

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
            style={{ color: focused ? '#6D28D9' : '#A78BCA' }} />
          <input type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search articles, topics, authors..."
            className="w-full pl-12 pr-12 py-4 text-base outline-none transition-all"
            style={{
              borderRadius:16,
              background: focused ? '#FFFFFF' : '#FFFBF4',
              border:`1.5px solid ${focused?'#6D28D9':'rgba(109,40,217,0.18)'}`,
              color:'#1A0B2E',
              boxShadow: focused ? '0 6px 28px rgba(109,40,217,0.15)' : '0 2px 8px rgba(109,40,217,0.06)',
            }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); onSearch?.(''); }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color:'#A78BCA' }}>
              <FiX className="w-5 h-5"/>
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity:0, y:-8, scale:0.98 }}
            animate={{ opacity:1, y:0,  scale:1 }}
            exit={{    opacity:0, y:-8, scale:0.98 }}
            transition={{ duration:0.16 }}
            className="absolute left-0 right-0 mt-2 z-50 overflow-hidden"
            style={{ background:'#1E0D3A', borderRadius:16, boxShadow:'0 20px 60px rgba(30,13,58,0.35), 0 0 0 1px rgba(255,255,255,0.07)' }}
          >
            {/* Recent */}
            {!query && recent.length > 0 && (
              <div className="p-3">
                <div className="flex justify-between items-center px-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color:'rgba(245,236,216,0.35)' }}>Recent</span>
                  <button onClick={() => { setRecent([]); localStorage.removeItem('bv_searches'); }}
                    className="text-xs font-medium" style={{ color:'#A78BFA' }}>Clear</button>
                </div>
                {recent.map((s,i) => (
                  <button key={i} onClick={() => setQuery(s)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                    style={{ color:'rgba(245,236,216,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(109,40,217,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}
                  >
                    <FiClock className="w-4 h-4 flex-shrink-0" style={{ color:'rgba(245,236,216,0.3)' }} />
                    <span className="text-sm">{s}</span>
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8">
                <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor:'rgba(167,139,250,0.3)', borderTopColor:'#A78BFA' }} />
                <span className="text-sm" style={{ color:'rgba(245,236,216,0.5)' }}>Searching...</span>
              </div>
            )}
            {!loading && results.length > 0 && (
              <div className="p-3">
                <span className="text-xs font-semibold uppercase tracking-wide px-2 mb-2 block" style={{ color:'rgba(245,236,216,0.35)' }}>
                  Results for "{query}"
                </span>
                {results.map(r => (
                  <button key={r._id} onClick={() => handleSelect(r.slug, r.title)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    onMouseEnter={e => e.currentTarget.style.background='rgba(109,40,217,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}
                  >
                    <img src={r.coverImage||`https://picsum.photos/seed/${r._id?.slice(-4)||1}/48/48`}
                      alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold line-clamp-1" style={{ color:'#F5ECD8' }}>{r.title}</p>
                      <p className="text-xs mt-0.5" style={{ color:'rgba(245,236,216,0.4)' }}>by {r.author?.name} · {r.readTime||1} min</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && query && results.length===0 && (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color:'rgba(245,236,216,0.4)' }}>No results for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
