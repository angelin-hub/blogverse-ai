import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import BlogCard from '../components/BlogCard';
import { useBlogs } from '../hooks/useBlogs';
import api from '../utils/api';
import { FiArrowRight, FiArrowDown, FiTrendingUp, FiZap, FiBookOpen, FiClock, FiEye, FiHeart } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { BsRobot } from 'react-icons/bs';

/* ─── particles ─── */
const DOTS = Array.from({length:16},(_,i)=>({
  id:i, size:Math.random()*4+2,
  x:Math.random()*100, y:Math.random()*100,
  dur:Math.random()*6+4, delay:Math.random()*4,
}));

/* ─── hero images ─── */
const HERO_IMGS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
  'https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&q=80',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80',
];

/* ─── feature pills ─── */
const FEATURES = [
  { icon:'🤖', label:'AI Writing Assistant' },
  { icon:'⚡', label:'Instant Publishing' },
  { icon:'🎨', label:'Rich Editor' },
  { icon:'📊', label:'Analytics' },
  { icon:'🔍', label:'Smart Search' },
  { icon:'🌍', label:'Global Community' },
];

/* ─── Hero Section ─── */
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:['start start','end start'] });
  const y1 = useTransform(scrollYProgress,[0,1],[0,-80]);
  const y2 = useTransform(scrollYProgress,[0,1],[0,-40]);
  const opacity = useTransform(scrollYProgress,[0,0.7],[1,0]);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i=>(i+1)%HERO_IMGS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background:'linear-gradient(145deg,#FDF6EC 0%,#F5ECD8 35%,#EDE0CC 100%)' }}>

      {/* dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage:'radial-gradient(circle,#6D28D9 1.5px,transparent 1.5px)', backgroundSize:'32px 32px' }}/>

      {/* blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(109,40,217,0.09) 0%,transparent 70%)', transform:'translate(20%,-20%)' }}/>
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(109,40,217,0.06) 0%,transparent 70%)' }}/>

      {/* particles */}
      {DOTS.map(p=>(
        <motion.div key={p.id}
          animate={{ y:[0,-18,0], opacity:[0.2,0.7,0.2] }}
          transition={{ duration:p.dur, repeat:Infinity, ease:'easeInOut', delay:p.delay }}
          className="absolute rounded-full pointer-events-none"
          style={{ width:p.size, height:p.size, left:`${p.x}%`, top:`${p.y}%`,
            background:'rgba(109,40,217,0.35)', boxShadow:`0 0 ${p.size*3}px rgba(109,40,217,0.3)` }}
        />
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <motion.div style={{ y:y1, opacity }} className="space-y-8">
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.6}}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{ background:'rgba(109,40,217,0.10)', border:'1.5px solid rgba(109,40,217,0.20)' }}>
              <motion.span animate={{rotate:[0,14,-14,0]}} transition={{duration:3,repeat:Infinity}}>
                <HiSparkles className="w-4 h-4" style={{color:'#6D28D9'}}/>
              </motion.span>
              <span className="text-sm font-semibold" style={{color:'#4B3068'}}>AI-Powered Blogging</span>
              <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{background:'#6D28D9'}}/><span className="relative inline-flex h-2 w-2 rounded-full" style={{background:'#6D28D9'}}/></span>
            </motion.div>

            <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.1}}
              style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(3rem,6vw,5rem)', fontWeight:900, lineHeight:1.08, color:'#1A0B2E' }}>
              Where Great
              <br/>
              <span style={{ background:'linear-gradient(135deg,#6D28D9 0%,#8B5CF6 50%,#6D28D9 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'shimmerText 3s linear infinite' }}>
                Stories
              </span>
              <br/>
              Come Alive
            </motion.h1>

            <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.25}}
              className="text-xl leading-relaxed max-w-md" style={{color:'#7C5FA8'}}>
              Craft compelling narratives with AI assistance. Publish, connect, and grow your audience on the world's most elegant blogging platform.
            </motion.p>

            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.38}}
              className="flex flex-wrap gap-3">
              <Link to="/create" className="btn-primary text-base px-7 py-3.5 group">
                Start Writing <FiArrowRight className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link to="/blogs" className="btn-secondary text-base px-7 py-3.5">
                Explore Blogs
              </Link>
            </motion.div>

            {/* Feature pills */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6,delay:0.55}}
              className="flex flex-wrap gap-2">
              {FEATURES.map((f,i)=>(
                <motion.span key={i} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
                  transition={{delay:0.6+i*0.06}}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background:'rgba(109,40,217,0.08)', border:'1px solid rgba(109,40,217,0.14)', color:'#4B3068' }}>
                  {f.icon} {f.label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — floating card stack */}
          <motion.div style={{ y:y2 }} className="hidden lg:block relative h-[560px]">
            {HERO_IMGS.map((src,i)=>(
              <motion.div key={i}
                animate={{ opacity: imgIdx===i?1:0.35, scale: imgIdx===i?1:0.92, zIndex: imgIdx===i?10:i }}
                transition={{ duration:0.6, type:'spring', stiffness:200 }}
                className="absolute rounded-3xl overflow-hidden"
                style={{
                  width:300, height:220,
                  top: i===0?40:i===1?180:320,
                  left: i===0?80:i===1?180:40,
                  boxShadow: imgIdx===i
                    ? '0 24px 60px rgba(109,40,217,0.25), 0 0 0 1px rgba(109,40,217,0.15)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
                }}>
                <img src={src} alt="" className="w-full h-full object-cover"/>
                <div className="absolute inset-0"
                  style={{ background:'linear-gradient(to top,rgba(26,11,46,0.7),transparent)' }}/>
                {imgIdx===i && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.15)'}}>
                      <motion.div className="h-full rounded-full" style={{background:'linear-gradient(90deg,#6D28D9,#8B5CF6)'}}
                        initial={{width:0}} animate={{width:'100%'}} transition={{duration:3,ease:'linear'}}/>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Floating stat card */}
            <motion.div animate={{y:[0,-8,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut'}}
              className="absolute bottom-8 right-0 p-4 rounded-2xl z-20"
              style={{ background:'#1E0D3A', border:'1px solid rgba(109,40,217,0.3)', boxShadow:'0 12px 40px rgba(30,13,58,0.3)', width:160 }}>
              <div className="flex items-center gap-2 mb-2">
                <BsRobot className="w-4 h-4" style={{color:'#A78BFA'}}/>
                <span className="text-xs font-semibold" style={{color:'rgba(245,236,216,0.6)'}}>AI Assisted</span>
              </div>
              <p className="text-2xl font-extrabold" style={{fontFamily:'"Playfair Display",serif',color:'#F5ECD8'}}>10K+</p>
              <p className="text-xs" style={{color:'rgba(245,236,216,0.4)'}}>articles published</p>
            </motion.div>

            <motion.div animate={{y:[0,-6,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut',delay:1}}
              className="absolute top-8 right-4 p-4 rounded-2xl z-20"
              style={{ background:'#1E0D3A', border:'1px solid rgba(109,40,217,0.3)', boxShadow:'0 12px 40px rgba(30,13,58,0.3)', width:140 }}>
              <FiZap className="w-4 h-4 mb-2" style={{color:'#A78BFA'}}/>
              <p className="text-2xl font-extrabold" style={{fontFamily:'"Playfair Display",serif',color:'#F5ECD8'}}>1M+</p>
              <p className="text-xs" style={{color:'rgba(245,236,216,0.4)'}}>readers worldwide</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-xs font-medium" style={{color:'rgba(109,40,217,0.5)'}}>Scroll to explore</span>
          <motion.div animate={{y:[0,6,0]}} transition={{duration:1.5,repeat:Infinity}}>
            <FiArrowDown className="w-4 h-4" style={{color:'rgba(109,40,217,0.5)'}}/>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Featured section — asymmetric ─── */
function FeaturedSection({ blogs }) {
  if (!blogs.length) return null;
  const [main, ...rest] = blogs.slice(0,3);

  return (
    <section className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
        viewport={{once:true}} transition={{duration:0.6}}
        className="flex items-end justify-between mb-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{color:'#A78BFA'}}>Featured</span>
          <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'2.5rem',fontWeight:800,color:'#1A0B2E'}}>
            Editor's Picks
          </h2>
        </div>
        <Link to="/blogs" className="btn-secondary text-sm py-2 px-5 hidden sm:flex items-center gap-1.5">
          All Articles <FiArrowRight/>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Large left card */}
        <motion.div initial={{opacity:0,x:-32}} whileInView={{opacity:1,x:0}}
          viewport={{once:true}} transition={{duration:0.7}}
          className="lg:col-span-3 group rounded-3xl overflow-hidden relative cursor-pointer"
          style={{ height:460, boxShadow:'0 16px 48px rgba(30,13,58,0.14)' }}
          whileHover={{scale:1.01}}>
          <img src={main.coverImage||`https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80`}
            alt={main.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
          <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(26,11,46,0.92) 0%,rgba(26,11,46,0.3) 50%,transparent 100%)'}}/>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            {main.category && (
              <span className="badge mb-3 text-xs" style={{background:'rgba(109,40,217,0.6)',color:'#C4B5FD'}}>
                {main.category.icon} {main.category.name}
              </span>
            )}
            <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:'1.75rem',fontWeight:700,color:'#F5ECD8',lineHeight:1.2}} className="mb-3 line-clamp-2">
              {main.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={main.author?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(main.author?.name||'A')}&background=2A1250&color=F5ECD8`}
                  className="w-8 h-8 rounded-full" alt=""/>
                <span className="text-sm font-medium" style={{color:'rgba(245,236,216,0.7)'}}>{main.author?.name}</span>
              </div>
              <Link to={`/blog/${main.slug}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{background:'rgba(109,40,217,0.55)',color:'#F5ECD8',border:'1px solid rgba(109,40,217,0.4)'}}>
                Read <FiArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right stacked cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {rest.map((blog,i)=>(
            <motion.div key={blog._id}
              initial={{opacity:0,x:32}} whileInView={{opacity:1,x:0}}
              viewport={{once:true}} transition={{duration:0.6,delay:i*0.12}}
              className="group rounded-2xl overflow-hidden flex gap-4 p-4 transition-all cursor-pointer"
              style={{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.07)',flex:1}}
              whileHover={{scale:1.02,boxShadow:'0 8px 32px rgba(109,40,217,0.25)'}}>
              <img src={blog.coverImage||`https://images.unsplash.com/photo-1542435503-956c469947f6?w=200&q=80`}
                alt={blog.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0"/>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-xs font-semibold mb-1" style={{color:'#A78BFA'}}>
                  {blog.category?.name||'General'}
                </span>
                <Link to={`/blog/${blog.slug}`}>
                  <h4 className="font-bold line-clamp-2 mb-2 text-sm leading-snug transition-colors"
                    style={{fontFamily:'"Playfair Display",serif',color:'#F5ECD8'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
                    onMouseLeave={e=>e.currentTarget.style.color='#F5ECD8'}>
                    {blog.title}
                  </h4>
                </Link>
                <p className="text-xs" style={{color:'rgba(245,236,216,0.4)'}}>{blog.readTime||1} min read</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trending marquee strip ─── */
function TrendingStrip({ blogs }) {
  if (!blogs.length) return null;
  const doubled = [...blogs, ...blogs];
  return (
    <div className="relative py-6 overflow-hidden"
      style={{ background:'#1E0D3A', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <motion.div animate={{x:['0%','-50%']}} transition={{duration:30,repeat:Infinity,ease:'linear'}}
        className="flex gap-6 whitespace-nowrap w-max">
        {doubled.map((b,i)=>(
          <Link key={i} to={`/blog/${b.slug}`}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl flex-shrink-0 transition-all"
            style={{background:'rgba(109,40,217,0.15)',border:'1px solid rgba(109,40,217,0.2)'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(109,40,217,0.3)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(109,40,217,0.15)';}}>
            <FiTrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{color:'#A78BFA'}}/>
            <span className="text-sm font-medium" style={{color:'rgba(245,236,216,0.8)'}}>{b.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(109,40,217,0.35)',color:'#C4B5FD'}}>{b.views||0} views</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Latest Articles — Premium list + card mix ─── */
function LatestGrid({ blogs, loading, categories, selectedCat, onCatChange, page, setPage, pagination }) {

  /* Skeleton */
  if (loading) return (
    <div className="space-y-4">
      {/* 2 large skeletons top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0,1].map(i=>(
          <div key={i} className="rounded-2xl overflow-hidden" style={{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.05)'}}>
            <div className="skeleton w-full" style={{height:200,borderRadius:0}}/>
            <div className="p-5 space-y-3">
              <div className="skeleton h-4 w-2/3 rounded"/>
              <div className="skeleton h-3 w-full rounded"/>
            </div>
          </div>
        ))}
      </div>
      {/* 3 row skeletons */}
      {[0,1,2].map(i=>(
        <div key={i} className="rounded-2xl flex gap-4 p-4" style={{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="skeleton rounded-xl flex-shrink-0" style={{width:80,height:64}}/>
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-4 w-3/4 rounded"/>
            <div className="skeleton h-3 w-1/2 rounded"/>
          </div>
        </div>
      ))}
    </div>
  );

  /* Category filter */
  const CatFilter = () => (
    <div className="flex flex-wrap gap-2 mb-8">
      {[{_id:'all',name:'All',slug:'',icon:'🌐',color:'#6D28D9'}, ...categories.slice(0,8)].map(cat=>{
        const active = selectedCat===cat.slug || (!selectedCat && cat.slug==='');
        return (
          <motion.button key={cat._id} onClick={()=>onCatChange(cat.slug)}
            whileHover={{scale:1.04}} whileTap={{scale:0.96}}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={active
              ? {background:`linear-gradient(135deg,${cat.color||'#6D28D9'},${cat.color||'#8B5CF6'})`,color:'#F5ECD8',boxShadow:`0 4px 16px ${cat.color||'#6D28D9'}44`,border:'none'}
              : {background:'#1E0D3A',color:'rgba(245,236,216,0.5)',border:'1px solid rgba(255,255,255,0.07)'}
            }>
            <span>{cat.icon}</span> {cat.name}
          </motion.button>
        );
      })}
    </div>
  );

  if (blogs.length === 0) return (
    <div>
      <CatFilter/>
      <div className="text-center py-24 rounded-3xl"
        style={{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.06)'}}>
        <p className="text-5xl mb-4">📭</p>
        <p className="text-xl font-bold mb-2" style={{fontFamily:'"Playfair Display",serif',color:'#F5ECD8'}}>No articles yet</p>
        <p className="mb-6 text-sm" style={{color:'rgba(245,236,216,0.4)'}}>Be the first to share your story</p>
        <Link to="/create" className="btn-primary text-sm">Start Writing</Link>
      </div>
    </div>
  );

  /* Split: first 2 = featured cards, rest = compact rows */
  const cardBlogs = blogs.slice(0, 2);
  const rowBlogs  = blogs.slice(2);

  return (
    <div>
      <CatFilter/>

      {/* ── Top 2 — large cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {cardBlogs.map((b,i) => <BlogCard key={b._id} blog={b} index={i}/>)}
      </div>

      {/* ── Remaining — premium horizontal rows ── */}
      {rowBlogs.length > 0 && (
        <div className="space-y-3">
          {rowBlogs.map((blog, i) => {
            const catColor = blog.category?.color || '#6D28D9';
            const cover = blog.coverImage?.startsWith('http')
              ? blog.coverImage
              : `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&q=75&fit=crop`;
            const timeAgo = blog.createdAt
              ? formatDistanceToNow(new Date(blog.createdAt), {addSuffix:true})
              : '';

            return (
              <motion.div key={blog._id}
                initial={{opacity:0, x:-20}}
                animate={{opacity:1, x:0}}
                transition={{duration:0.45, delay:i*0.06, ease:[0.25,0.46,0.45,0.94]}}
                className="group relative rounded-2xl overflow-hidden"
                style={{
                  background:'linear-gradient(135deg,#1E0D3A,#160828)',
                  border:'1px solid rgba(255,255,255,0.05)',
                  transition:'box-shadow 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 32px ${catColor}22`; e.currentTarget.style.borderColor=`${catColor}44`;}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)';}}
              >
                {/* Left accent bar — animates on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{background:`linear-gradient(180deg,transparent,${catColor},transparent)`}}/>

                <Link to={`/blog/${blog.slug}`} className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 rounded-xl overflow-hidden"
                    style={{width:72,height:56}}>
                    <img src={cover} alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={e=>{e.target.src=`https://picsum.photos/seed/${i+20}/72/56`;}}/>
                    <div className="absolute inset-0 rounded-xl"
                      style={{background:`linear-gradient(135deg,${catColor}44,transparent)`}}/>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {blog.category && (
                        <span className="text-xs font-bold"
                          style={{color:catColor}}>
                          {blog.category.icon} {blog.category.name}
                        </span>
                      )}
                      <span className="text-xs" style={{color:'rgba(245,236,216,0.25)'}}>·</span>
                      <span className="text-xs" style={{color:'rgba(245,236,216,0.3)'}}>{timeAgo}</span>
                    </div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-1 transition-colors"
                      style={{fontFamily:'"Playfair Display",serif', color:'rgba(245,236,216,0.9)'}}
                      onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.9)'}>
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs"
                        style={{color:'rgba(245,236,216,0.3)'}}>
                        <FiClock className="w-3 h-3"/> {blog.readTime||1}m
                      </span>
                      <span className="flex items-center gap-1 text-xs"
                        style={{color:'rgba(245,236,216,0.3)'}}>
                        <FiEye className="w-3 h-3"/> {blog.views||0}
                      </span>
                      <span className="flex items-center gap-1 text-xs"
                        style={{color:'rgba(245,236,216,0.3)'}}>
                        <FiHeart className="w-3 h-3"/> {blog.likesCount??0}
                      </span>
                    </div>
                  </div>

                  {/* Number */}
                  <span className="text-3xl font-black flex-shrink-0 leading-none hidden sm:block"
                    style={{color:'rgba(255,255,255,0.04)',fontFamily:'"Playfair Display",serif'}}>
                    {String(i+3).padStart(2,'0')}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.07)',color:'#A78BFA'}}>
            ← Prev
          </motion.button>

          <div className="flex items-center gap-1.5">
            {Array.from({length:pagination.pages},(_,i)=>i+1)
              .filter(p=>p===1||p===pagination.pages||Math.abs(p-page)<=1)
              .reduce((acc,p,i,arr)=>{if(i>0&&arr[i-1]!==p-1)acc.push('…');acc.push(p);return acc;},[])
              .map((p,i)=> p==='…'
                ? <span key={`e${i}`} className="px-2" style={{color:'rgba(245,236,216,0.3)'}}>…</span>
                : (
                  <motion.button key={p} whileHover={{scale:1.08}} whileTap={{scale:0.94}}
                    onClick={()=>setPage(p)}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                    style={page===p
                      ? {background:'linear-gradient(135deg,#6D28D9,#8B5CF6)',color:'#F5ECD8',boxShadow:'0 4px 16px rgba(109,40,217,0.45)'}
                      : {background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(245,236,216,0.55)'}
                    }>{p}
                  </motion.button>
                )
              )
            }
          </div>

          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.07)',color:'#A78BFA'}}>
            Next →
          </motion.button>
        </div>
      )}
    </div>
  );
}

/* ─── AI CTA Banner ─── */
function AIBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}}
        className="relative rounded-3xl overflow-hidden p-10 lg:p-14"
        style={{ background:'linear-gradient(135deg,#1A0B2E 0%,#2A1250 50%,#1A0B2E 100%)', border:'1px solid rgba(109,40,217,0.3)', boxShadow:'0 24px 80px rgba(30,13,58,0.2)' }}>
        {/* Glow orbs inside */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background:'rgba(109,40,217,0.2)', filter:'blur(60px)', transform:'translate(20%,-20%)' }}/>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background:'rgba(139,92,246,0.15)', filter:'blur(50px)', transform:'translate(-20%,20%)' }}/>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle,rgba(245,236,216,0.8) 1.5px,transparent 1.5px)', backgroundSize:'24px 24px' }}/>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
              <BsRobot className="w-6 h-6" style={{color:'#A78BFA'}}/>
              <span className="text-sm font-bold uppercase tracking-widest" style={{color:'#A78BFA'}}>AI Writing Assistant</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight"
              style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
              Write 10x Faster with AI
            </h2>
            <p className="text-lg leading-relaxed max-w-lg" style={{ color:'rgba(245,236,216,0.6)' }}>
              Generate ideas, craft titles, polish your prose, and get instant feedback — all powered by GPT-4 directly in your editor.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-3 w-full lg:w-auto">
            <Link to="/create" className="btn-primary text-base px-8 py-3.5 text-center">
              Try AI Writing →
            </Link>
            <div className="flex items-center justify-center gap-6">
              {[['💡','Ideas'],['✏️','Titles'],['🪄','Polish']].map(([e,l])=>(
                <div key={l} className="text-center">
                  <span className="text-xl">{e}</span>
                  <p className="text-xs mt-0.5" style={{color:'rgba(245,236,216,0.45)'}}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Main Home page ─── */
export default function Home() {
  const { blogs, loading, pagination, fetchBlogs } = useBlogs();
  const [featured,    setFeatured]    = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    fetchBlogs({ status:'published', page, limit:9, category:selectedCat||undefined });
  }, [page, selectedCat]);

  useEffect(() => {
    Promise.all([
      api.get('/blogs/featured'),
      api.get('/categories'),
      api.get('/blogs', { params:{ status:'published', sort:'-views', limit:8 } }),
    ]).then(([fr,cr,tr]) => {
      setFeatured(fr.data.blogs||[]);
      setCategories(cr.data.categories||[]);
      setTrending(tr.data.blogs||[]);
    }).catch(()=>{});
  }, []);

  const handleCatChange = slug => { setSelectedCat(slug); setPage(1); };

  return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>

      <HeroSection />

      {featured.length > 0 && <FeaturedSection blogs={featured} />}

      {trending.length > 0 && <TrendingStrip blogs={trending} />}

      <AIBanner />

      {/* Latest Articles section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{duration:0.6}} className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{color:'#A78BFA'}}>Discover</span>
          <div className="flex items-end justify-between">
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:'2.5rem',fontWeight:800,color:'#1A0B2E'}}>
              Latest Articles
            </h2>
            <Link to="/blogs" className="btn-secondary text-sm py-2 px-5 hidden sm:flex items-center gap-1.5">
              View All <FiArrowRight/>
            </Link>
          </div>
        </motion.div>

        <LatestGrid
          blogs={blogs} loading={loading}
          categories={categories} selectedCat={selectedCat}
          onCatChange={handleCatChange}
          page={page} setPage={setPage} pagination={pagination}
        />
      </section>
    </div>
  );
}
