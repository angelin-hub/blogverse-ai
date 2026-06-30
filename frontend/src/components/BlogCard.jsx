import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiEye, FiClock, FiArrowUpRight } from 'react-icons/fi';

const PHOTOS = [
  'photo-1499750310107-5fef28a66643',
  'photo-1542435503-956c469947f6',
  'photo-1455390582262-044cdead277a',
  'photo-1486312338219-ce68d2c6f44d',
  'photo-1488190211105-8b0e65b80b4e',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1519389950473-47ba0277781c',
  'photo-1484417894907-623942c8ee29',
  'photo-1432888498266-38ffec3eaf0a',
  'photo-1501504905252-473c47e087f8',
];

const getCover = (blog, index) => {
  if (blog.coverImage?.startsWith('http')) return blog.coverImage;
  return `https://images.unsplash.com/${PHOTOS[index % PHOTOS.length]}?w=600&q=80&fit=crop&auto=format`;
};

export default function BlogCard({ blog, index = 0 }) {
  if (!blog) return null;

  const cover   = getCover(blog, index);
  const timeAgo = blog.createdAt
    ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })
    : '';
  const catColor = blog.category?.color || '#6D28D9';
  const num      = String(index + 1).padStart(2, '0');

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      {/* Card */}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative rounded-2xl overflow-hidden flex flex-col h-full"
        style={{
          background: 'linear-gradient(145deg, #1E0D3A 0%, #160828 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.35s ease, border-color 0.35s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 20px 60px rgba(109,40,217,0.28), 0 0 0 1px ${catColor}44`;
          e.currentTarget.style.borderColor = `${catColor}55`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      >
        {/* ── Top color line ── */}
        <div className="h-0.5 w-full absolute top-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${catColor}, transparent)` }} />

        {/* ── Image ── */}
        <Link to={`/blog/${blog.slug}`} className="block relative overflow-hidden flex-shrink-0"
          style={{ height: 200 }}>
          <motion.img
            src={cover}
            alt={blog.title}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.src = `https://picsum.photos/seed/${index + 10}/600/400`; }}
          />

          {/* Dark scrim */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(22,8,40,0.95) 100%)' }} />

          {/* ── Index number top-right ── */}
          <span className="absolute top-3 right-3 text-xs font-black leading-none"
            style={{
              fontFamily: '"Playfair Display",serif',
              color: 'rgba(255,255,255,0.15)',
              fontSize: '2rem',
              lineHeight: 1,
            }}>
            {num}
          </span>

          {/* ── Category badge ── */}
          {blog.category && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{
                background: `${catColor}28`,
                border: `1px solid ${catColor}55`,
                color: '#F5ECD8',
                backdropFilter: 'blur(8px)',
              }}>
              {blog.category.icon} {blog.category.name}
            </span>
          )}

          {/* ── Read time bottom-left ── */}
          <span className="absolute bottom-3 left-4 flex items-center gap-1 text-xs font-medium"
            style={{ color: 'rgba(245,236,216,0.55)' }}>
            <FiClock className="w-3 h-3" /> {blog.readTime || 1} min
          </span>
        </Link>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-5 pt-4">

          {/* Title */}
          <Link to={`/blog/${blog.slug}`} className="block mb-3">
            <h2
              className="font-bold leading-snug line-clamp-2 transition-colors duration-200"
              style={{
                fontFamily: '"Playfair Display",serif',
                fontSize: '1.05rem',
                color: '#F5ECD8',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = catColor === '#6D28D9' ? '#C4B5FD' : catColor; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#F5ECD8'; }}
            >
              {blog.title}
            </h2>
          </Link>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-4"
              style={{ color: 'rgba(245,236,216,0.45)' }}>
              {blog.excerpt.replace(/<[^>]*>/g, '')}
            </p>
          )}

          {/* ── Divider line ── */}
          <div className="mb-4" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

          {/* ── Footer row ── */}
          <div className="flex items-center justify-between">

            {/* Author */}
            <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-2 group/a">
              <div className="relative">
                <img
                  src={blog.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.name || 'U')}&background=2A1250&color=F5ECD8`}
                  alt={blog.author?.name}
                  className="w-7 h-7 rounded-full object-cover"
                  style={{ border: '1.5px solid rgba(167,139,250,0.3)' }}
                />
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: catColor, borderColor: '#1E0D3A' }} />
              </div>
              <span className="text-xs font-semibold truncate max-w-[72px] transition-colors"
                style={{ color: 'rgba(245,236,216,0.55)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C4B5FD'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,236,216,0.55)'}
              >
                {blog.author?.name || 'Anonymous'}
              </span>
            </Link>

            {/* Stats + Arrow */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,236,216,0.3)' }}>
                <FiHeart className="w-3 h-3" /> {blog.likesCount ?? blog.likes?.length ?? 0}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,236,216,0.3)' }}>
                <FiEye className="w-3 h-3" /> {blog.views || 0}
              </span>

              {/* Arrow button */}
              <Link to={`/blog/${blog.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: `${catColor}22`, border: `1px solid ${catColor}44` }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = catColor;
                    e.currentTarget.style.boxShadow = `0 4px 14px ${catColor}66`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `${catColor}22`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FiArrowUpRight className="w-3.5 h-3.5" style={{ color: '#F5ECD8' }} />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* ── Time ago ── */}
          <p className="text-xs mt-3" style={{ color: 'rgba(245,236,216,0.2)' }}>{timeAgo}</p>
        </div>

        {/* ── Bottom glow on hover ── */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${catColor}88, transparent)` }} />
      </motion.div>
    </motion.article>
  );
}
