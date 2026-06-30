import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useBlogs } from '../hooks/useBlogs';
import api from '../utils/api';
import { FiSearch, FiX, FiClock, FiEye, FiHeart, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/* ─── Unsplash covers ─── */
const COVERS = [
  'photo-1499750310107-5fef28a66643','photo-1542435503-956c469947f6',
  'photo-1455390582262-044cdead277a','photo-1486312338219-ce68d2c6f44d',
  'photo-1488190211105-8b0e65b80b4e','photo-1507003211169-0a1dd7228f2d',
  'photo-1519389950473-47ba0277781c','photo-1484417894907-623942c8ee29',
  'photo-1432888498266-38ffec3eaf0a','photo-1501504905252-473c47e087f8',
];
const cover = (blog, i) =>
  blog.coverImage?.startsWith('http')
    ? blog.coverImage
    : `https://images.unsplash.com/${COVERS[i % COVERS.length]}?w=800&q=80&fit=crop`;

const SORT = [
  { value:'-createdAt', label:'Latest' },
  { value:'-views',     label:'Trending' },
  { value:'-likesCount',label:'Popular' },
];

export default function Blogs() {
  const { blogs, loading, pagination, fetchBlogs } = useBlogs();
  const [cats,    setCats]    = useState([]);
  const [cat,     setCat]     = useState('');
  const [sort,    setSort]    = useState('-createdAt');
  const [page,    setPage]    = useState(1);
  const [q,       setQ]       = useState('');
  const [input,   setInput]   = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCats(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBlogs({ status:'published', page, limit:9, sort, category:cat||undefined, search:q||undefined });
  }, [page, sort, cat, q]);

  const go = e => { e.preventDefault(); setQ(input); setPage(1); };
  const clear = () => { setQ(''); setInput(''); setPage(1); };

  /* ── Skeleton ── */
  const Skel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({length:6}).map((_,i) => (
        <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-sm">
          <div className="skeleton h-52 w-full" style={{borderRadius:0}}/>
          <div className="p-6 space-y-3">
            <div className="skeleton h-3 w-20 rounded-full"/>
            <div className="skeleton h-5 w-full rounded"/>
            <div className="skeleton h-4 w-4/5 rounded"/>
            <div className="skeleton h-3 w-1/2 rounded"/>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:'#FDF6EC'}}>

      {/* ═══════════════════════════════
          HERO — full-width magazine header
      ═══════════════════════════════ */}
      <div className="relative" style={{background:'#1A0B2E', paddingBottom:'3rem'}}>
        {/* subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{backgroundImage:'radial-gradient(circle,rgba(245,236,216,0.9) 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
        {/* glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{background:'rgba(109,40,217,0.25)',filter:'blur(80px)',transform:'translate(20%,-30%)'}}/>

        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-2">
          {/* label */}
          <motion.p initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{color:'#A78BFA'}}>
            BlogVerse AI — Articles
          </motion.p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Heading */}
            <motion.h1 initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}
              className="font-black leading-none"
              style={{fontFamily:'"Playfair Display",serif',fontSize:'clamp(3rem,8vw,6rem)',color:'#F5ECD8'}}>
              Read.
              <br/>
              <span style={{
                background:'linear-gradient(90deg,#A78BFA,#F5ECD8)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'
              }}>Discover.</span>
              <br/>
              <span style={{color:'rgba(245,236,216,0.25)',fontSize:'0.55em',letterSpacing:'-0.02em'}}>
                {pagination.total || '—'} stories
              </span>
            </motion.h1>

            {/* Search box */}
            <motion.form initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.25}}
              onSubmit={go} className="flex gap-2 w-full lg:w-80">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'rgba(245,236,216,0.3)'}}/>
                <input value={input} onChange={e=>setInput(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-all"
                  style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',color:'#F5ECD8'}}
                  onFocus={e=>{e.target.style.borderColor='rgba(109,40,217,0.7)';e.target.style.background='rgba(255,255,255,0.12)';}}
                  onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.background='rgba(255,255,255,0.08)';}}
                />
                {input && <button type="button" onClick={()=>setInput('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:'rgba(245,236,216,0.3)'}}><FiX className="w-4 h-4"/></button>}
              </div>
              <button type="submit" className="btn-primary px-4 py-3 text-sm flex-shrink-0">Go</button>
            </motion.form>
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div className="relative max-w-6xl mx-auto px-6 mt-8">
          <div className="flex gap-2 overflow-x-auto pb-1"
            style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
            {[{_id:'all',name:'All',slug:'',icon:'✦',color:'#6D28D9'}, ...cats].map(c => {
              const active = cat===c.slug||(!cat&&c.slug==='');
              return (
                <button key={c._id} onClick={()=>{setCat(c.slug);setPage(1);}}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={active
                    ?{background:`linear-gradient(135deg,${c.color||'#6D28D9'},${c.color||'#8B5CF6'})`,color:'#F5ECD8',boxShadow:`0 4px 14px ${c.color||'#6D28D9'}55`,border:'none'}
                    :{background:'rgba(255,255,255,0.07)',color:'rgba(245,236,216,0.55)',border:'1px solid rgba(255,255,255,0.1)'}
                  }>
                  <span style={{fontSize:'0.85em'}}>{c.icon}</span>{c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 inset-x-0" style={{lineHeight:0}}>
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48L80 40C160 32 320 16 480 12C640 8 800 16 960 20C1120 24 1280 24 1360 24L1440 24V48H0Z" fill="#FDF6EC"/>
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════
          CONTROLS BAR
      ═══════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Active filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {q && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{background:'rgba(109,40,217,0.12)',border:'1px solid rgba(109,40,217,0.22)',color:'#6D28D9'}}>
              🔍 "{q}"
              <button onClick={clear} className="hover:opacity-70"><FiX className="w-3 h-3"/></button>
            </span>
          )}
          {!loading && (
            <span className="text-sm font-medium" style={{color:'#7C5FA8'}}>
              {pagination.total || 0} articles
            </span>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{color:'#9CA3AF'}}>Sort by</span>
          <div className="flex rounded-xl overflow-hidden" style={{border:'1px solid rgba(109,40,217,0.15)'}}>
            {SORT.map(s => (
              <button key={s.value} onClick={()=>{setSort(s.value);setPage(1);}}
                className="px-4 py-2 text-xs font-semibold transition-all"
                style={sort===s.value
                  ?{background:'linear-gradient(135deg,#6D28D9,#8B5CF6)',color:'#F5ECD8'}
                  :{background:'white',color:'#7C5FA8'}
                }>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════
          ARTICLES GRID — magazine style
      ═══════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? <Skel/> : blogs.length === 0 ? (
          <div className="text-center py-28">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-2xl font-bold mb-2" style={{fontFamily:'"Playfair Display",serif',color:'#1A0B2E'}}>Nothing here yet</h3>
            <p className="mb-6" style={{color:'#7C5FA8'}}>Try different keywords or browse all categories</p>
            <button onClick={()=>{setQ('');setInput('');setCat('');setPage(1);}} className="btn-primary text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => {
              const img      = cover(blog, i);
              const cc       = blog.category?.color || '#6D28D9';
              const timeAgo  = blog.createdAt ? formatDistanceToNow(new Date(blog.createdAt),{addSuffix:true}) : '';
              /* First card spans 2 cols on lg */
              const isBig = i === 0;

              return (
                <motion.article key={blog._id}
                  initial={{opacity:0, y:28}}
                  animate={{opacity:1, y:0}}
                  transition={{duration:0.5, delay:i*0.07, ease:[0.25,0.46,0.45,0.94]}}
                  className={`group ${isBig ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  <Link to={`/blog/${blog.slug}`} className="block h-full">
                    <div className="h-full rounded-3xl overflow-hidden bg-white flex flex-col"
                      style={{
                        boxShadow:'0 2px 20px rgba(109,40,217,0.07)',
                        border:'1px solid rgba(109,40,217,0.08)',
                        transition:'box-shadow 0.3s ease, transform 0.3s ease',
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 16px 48px rgba(109,40,217,0.16)`;e.currentTarget.style.transform='translateY(-4px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 20px rgba(109,40,217,0.07)';e.currentTarget.style.transform='translateY(0)';}}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden flex-shrink-0" style={{height: isBig ? 320 : 220}}>
                        <img src={img} alt={blog.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={e=>{e.target.src=`https://picsum.photos/seed/${i+5}/800/400`;}}
                        />
                        {/* Category badge */}
                        {blog.category && (
                          <span className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                            style={{background:`linear-gradient(135deg,${cc}dd,${cc})`,boxShadow:`0 4px 12px ${cc}44`}}>
                            {blog.category.icon} {blog.category.name}
                          </span>
                        )}
                        {/* Read time badge */}
                        <span className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{background:'rgba(255,255,255,0.92)',backdropFilter:'blur(8px)',color:'#4B3068'}}>
                          <FiClock className="w-3 h-3"/> {blog.readTime||1} min
                        </span>
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-6">
                        {/* Title */}
                        <h2 className="font-bold leading-snug mb-3 transition-colors group-hover:text-purple-700"
                          style={{
                            fontFamily:'"Playfair Display",serif',
                            fontSize: isBig ? '1.5rem' : '1.1rem',
                            color:'#1A0B2E',
                            lineHeight:1.25,
                          }}>
                          {blog.title}
                        </h2>

                        {/* Excerpt */}
                        {blog.excerpt && (
                          <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-4"
                            style={{color:'#6B7280'}}>
                            {blog.excerpt.replace(/<[^>]*>/g,'')}
                          </p>
                        )}

                        {/* Tags */}
                        {blog.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {blog.tags.slice(0,3).map(tag => (
                              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{background:`${cc}12`,color:cc,border:`1px solid ${cc}25`}}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 mt-auto"
                          style={{borderTop:'1px solid rgba(109,40,217,0.07)'}}>
                          {/* Author */}
                          <div className="flex items-center gap-2.5">
                            <img
                              src={blog.author?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.name||'U')}&background=6D28D9&color=fff`}
                              alt={blog.author?.name}
                              className="w-8 h-8 rounded-full object-cover"
                              style={{border:`2px solid ${cc}33`}}
                            />
                            <div>
                              <p className="text-xs font-semibold" style={{color:'#1A0B2E'}}>{blog.author?.name||'Anonymous'}</p>
                              <p className="text-xs" style={{color:'#9CA3AF'}}>{timeAgo}</p>
                            </div>
                          </div>

                          {/* Stats + arrow */}
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs" style={{color:'#9CA3AF'}}><FiEye className="w-3.5 h-3.5"/>{blog.views||0}</span>
                            <span className="flex items-center gap-1 text-xs" style={{color:'#9CA3AF'}}><FiHeart className="w-3.5 h-3.5"/>{blog.likesCount||0}</span>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                              style={{background:`${cc}12`,border:`1px solid ${cc}22`}}
                              onMouseEnter={e=>{e.currentTarget.style.background=cc;}}
                              onMouseLeave={e=>{e.currentTarget.style.background=`${cc}12`;}}>
                              <FiArrowRight className="w-3.5 h-3.5" style={{color:cc}}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* ─── Pagination ─── */}
        {pagination.pages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-14 flex-wrap">
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
              onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{background:'#1A0B2E',color:'#C4B5FD',border:'1px solid rgba(109,40,217,0.25)'}}>
              <FiChevronLeft className="w-4 h-4"/> Prev
            </motion.button>

            {Array.from({length:pagination.pages},(_,i)=>i+1)
              .filter(p=>p===1||p===pagination.pages||Math.abs(p-page)<=2)
              .reduce((acc,p,i,arr)=>{if(i>0&&arr[i-1]!==p-1)acc.push('…');acc.push(p);return acc;},[])
              .map((p,i)=> p==='…'
                ? <span key={`e${i}`} style={{color:'#9CA3AF'}}>…</span>
                : (
                  <motion.button key={p} whileHover={{scale:1.08}} whileTap={{scale:0.94}}
                    onClick={()=>setPage(p)}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                    style={page===p
                      ?{background:'linear-gradient(135deg,#6D28D9,#8B5CF6)',color:'white',boxShadow:'0 4px 16px rgba(109,40,217,0.4)'}
                      :{background:'white',border:'1px solid rgba(109,40,217,0.15)',color:'#4B3068',boxShadow:'0 2px 8px rgba(109,40,217,0.06)'}
                    }>{p}
                  </motion.button>
                )
              )
            }

            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
              onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{background:'#1A0B2E',color:'#C4B5FD',border:'1px solid rgba(109,40,217,0.25)'}}>
              Next <FiChevronRight className="w-4 h-4"/>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
