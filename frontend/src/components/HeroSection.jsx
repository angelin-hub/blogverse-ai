import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPenTool } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import SearchBar from './SearchBar';

const STATS = [
  { v:'10K+', l:'Articles', e:'📝' },
  { v:'5K+',  l:'Writers',  e:'✍️' },
  { v:'1M+',  l:'Readers',  e:'👥' },
];

/* Floating preview cards with real images */
const PREVIEW_CARDS = [
  { img:'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&q=75', title:'The Art of Writing', tag:'✍️ Writing', rot:-7, tx:-310, ty:-70, delay:0 },
  { img:'https://images.unsplash.com/photo-1542435503-956c469947f6?w=300&q=75',    title:'Tech Insights 2024', tag:'💻 Tech',    rot: 6, tx: 310, ty:-40, delay:0.2 },
  { img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=75', title:'Creative Spaces',    tag:'🎨 Design', rot:-4, tx:-280, ty:110, delay:0.4 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background:'linear-gradient(145deg, #FDF6EC 0%, #F5ECD8 40%, #EDE0CC 100%)' }}
    >
      {/* Soft glow blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background:'rgba(109,40,217,0.08)', filter:'blur(100px)', transform:'translate(20%,-20%)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'rgba(109,40,217,0.06)', filter:'blur(90px)', transform:'translate(-20%,20%)' }} />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background:'rgba(139,92,246,0.05)', filter:'blur(80px)', transform:'translate(-50%,-50%)' }} />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage:'radial-gradient(circle, #6D28D9 1.5px, transparent 1.5px)', backgroundSize:'32px 32px' }} />

      {/* Floating preview cards — desktop */}
      <div className="hidden xl:block absolute inset-0 pointer-events-none">
        {PREVIEW_CARDS.map((c,i) => (
          <motion.div key={i}
            initial={{ opacity:0, scale:0.85 }}
            animate={{ opacity:1, scale:1, y:[0,-12,0] }}
            transition={{ opacity:{duration:0.9,delay:0.7+c.delay}, scale:{duration:0.9,delay:0.7+c.delay}, y:{duration:5+i*1.5,repeat:Infinity,ease:'easeInOut',delay:c.delay} }}
            className="absolute w-44 rounded-2xl overflow-hidden"
            style={{ left:`calc(50% + ${c.tx}px)`, top:`calc(50% + ${c.ty}px)`, rotate:c.rot, boxShadow:'0 20px 50px rgba(30,13,58,0.18), 0 0 0 1px rgba(109,40,217,0.12)' }}
          >
            <img src={c.img} alt={c.title} className="w-full h-24 object-cover" />
            {/* Dark violet card foot */}
            <div className="px-3 py-2.5" style={{ background:'#1E0D3A' }}>
              <p className="text-xs font-semibold truncate" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>{c.title}</p>
              <span className="text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full"
                style={{ background:'rgba(109,40,217,0.35)', color:'#C4B5FD', fontSize:'0.66rem' }}>
                {c.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">

        {/* Badge */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
          style={{ background:'rgba(109,40,217,0.08)', border:'1.5px solid rgba(109,40,217,0.18)', backdropFilter:'blur(8px)' }}
        >
          <motion.span animate={{ rotate:[0,14,-14,0] }} transition={{ duration:3, repeat:Infinity }}>
            <HiSparkles className="w-4 h-4" style={{ color:'#6D28D9' }} />
          </motion.span>
          <span className="text-sm font-semibold" style={{ color:'#4B3068' }}>AI-Powered Blogging Platform</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background:'#6D28D9' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background:'#6D28D9' }} />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.75, delay:0.12 }}
          className="font-bold leading-tight mb-6"
          style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(2.8rem,7vw,5.5rem)', color:'#1A0B2E' }}
        >
          Discover Stories<br/>
          <span className="gradient-text">That Matter</span>
        </motion.h1>

        {/* Sub */}
        <motion.p initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.25 }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color:'#7C5FA8' }}
        >
          BlogVerse AI combines human creativity with artificial intelligence —
          write better, discover faster, and connect with a global community.
        </motion.p>

        {/* Search */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.36 }}
          className="max-w-xl mx-auto mb-10">
          <SearchBar />
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.46 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link to="/blogs" className="btn-primary text-base px-8 py-3.5 group">
            Start Reading <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/create" className="btn-secondary text-base px-8 py-3.5">
            <FiPenTool /> Start Writing
          </Link>
        </motion.div>

        {/* Stats — dark violet cards */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.58 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {STATS.map((s,i) => (
            <motion.div key={i} whileHover={{ scale:1.05, y:-3 }} transition={{ type:'spring', stiffness:320 }}
              className="text-center px-8 py-4 rounded-2xl"
              style={{ background:'#1E0D3A', boxShadow:'0 8px 28px rgba(30,13,58,0.18)', border:'1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{s.e}</span>
                <span className="text-3xl font-extrabold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{s.v}</span>
              </div>
              <p className="text-sm mt-0.5" style={{ color:'rgba(245,236,216,0.45)' }}>{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#FDF6EC"/>
        </svg>
      </div>
    </section>
  );
}
