import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(r.data.categories||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>

      {/* Banner */}
      <div className="relative overflow-hidden py-16"
        style={{ background:'linear-gradient(135deg,#FDF6EC 0%,#F0E6D8 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background:'rgba(109,40,217,0.07)', filter:'blur(80px)', transform:'translate(25%,-25%)' }}/>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle,#6D28D9 1.5px,transparent 1.5px)', backgroundSize:'28px 28px' }}/>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-semibold"
            style={{ background:'rgba(109,40,217,0.10)', border:'1.5px solid rgba(109,40,217,0.18)', color:'#4B3068' }}
          >
            🗂️ All Categories
          </motion.span>
          <motion.h1
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}
          >
            Browse <span style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Categories</span>
          </motion.h1>
          <motion.p
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}
            className="text-lg" style={{ color:'#7C5FA8' }}
          >
            Find articles by topic that interests you most
          </motion.p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({length:8}).map((_,i)=>(
              <div key={i} className="skeleton rounded-2xl" style={{ height:140 }}/>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🗂️</p>
            <p className="text-xl font-bold" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
              No categories yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat,i)=>(
              <motion.div
                key={cat._id}
                initial={{ opacity:0, y:24 }}
                animate={{ opacity:1, y:0 }}
                transition={{ duration:0.45, delay:i*0.05 }}
                whileHover={{ y:-6, transition:{ type:'spring', stiffness:300, damping:20 } }}
              >
                <Link to={`/blogs?category=${cat.slug}`}
                  className="flex flex-col items-center text-center p-6 rounded-2xl group block transition-all"
                  style={{
                    background:'#1E0D3A',
                    border:'1px solid rgba(255,255,255,0.07)',
                    boxShadow:'0 4px 20px rgba(30,13,58,0.12)',
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 12px 36px rgba(109,40,217,0.28)'; e.currentTarget.style.borderColor='rgba(109,40,217,0.35)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 4px 20px rgba(30,13,58,0.12)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
                >
                  <span
                    className="text-4xl mb-3 w-16 h-16 flex items-center justify-center rounded-2xl"
                    style={{ background: cat.color ? `${cat.color}22` : 'rgba(109,40,217,0.20)' }}
                  >
                    {cat.icon||'📝'}
                  </span>
                  <h3 className="font-bold text-base mb-1 group-hover:text-purple-300 transition-colors"
                    style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs line-clamp-2 mb-2" style={{ color:'rgba(245,236,216,0.45)' }}>
                      {cat.description}
                    </p>
                  )}
                  <span className="mt-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background:'rgba(109,40,217,0.30)', color:'#C4B5FD' }}>
                    {cat.postCount||0} posts
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
