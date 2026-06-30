import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function CategoryFilter({ categories = [], selected = '', onChange }) {
  const ref = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(false);

  const check = () => {
    const el = ref.current; if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => { check(); window.addEventListener('resize',check); return ()=>window.removeEventListener('resize',check); }, [categories]);
  const scroll = d => { ref.current?.scrollBy({ left:d*240, behavior:'smooth' }); setTimeout(check,300); };

  const all = [{ _id:'all', name:'All', slug:'', icon:'🌐', color:'#6D28D9', postCount:null }, ...categories];

  return (
    <div className="relative">
      {canL && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 -ml-4 rounded-full flex items-center justify-center"
          style={{ background:'#1E0D3A', boxShadow:'0 2px 12px rgba(30,13,58,0.2)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <FiChevronLeft className="w-4 h-4" style={{ color:'#A78BFA' }}/>
        </button>
      )}
      <div ref={ref} onScroll={check} className="flex gap-2 overflow-x-auto hide-scrollbar py-1 px-0.5">
        {all.map(cat => {
          const active = selected===cat.slug || (!selected && cat.slug==='');
          return (
            <motion.button key={cat._id} whileTap={{ scale:0.95 }}
              onClick={() => onChange(cat.slug)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold flex-shrink-0 transition-all"
              style={active
                ? { background:`linear-gradient(135deg,${cat.color||'#6D28D9'},${cat.color||'#8B5CF6'})`, color:'#F5ECD8', boxShadow:`0 4px 14px ${cat.color||'#6D28D9'}44`, border:'none' }
                : { background:'#1E0D3A', color:'rgba(245,236,216,0.6)', border:'1px solid rgba(255,255,255,0.07)' }
              }
              onMouseEnter={e => { if(!active){ e.currentTarget.style.background='#2A1250'; e.currentTarget.style.color='#F5ECD8'; }}}
              onMouseLeave={e => { if(!active){ e.currentTarget.style.background='#1E0D3A'; e.currentTarget.style.color='rgba(245,236,216,0.6)'; }}}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.postCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={active?{background:'rgba(255,255,255,0.22)'}:{background:'rgba(255,255,255,0.08)'}}>
                  {cat.postCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      {canR && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 -mr-4 rounded-full flex items-center justify-center"
          style={{ background:'#1E0D3A', boxShadow:'0 2px 12px rgba(30,13,58,0.2)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <FiChevronRight className="w-4 h-4" style={{ color:'#A78BFA' }}/>
        </button>
      )}
    </div>
  );
}
