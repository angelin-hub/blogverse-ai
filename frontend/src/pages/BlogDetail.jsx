import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { useBlogs } from '../hooks/useBlogs';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import BlogCard from '../components/BlogCard';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiHeart, FiShare2, FiTwitter, FiLinkedin, FiLink,
  FiClock, FiEye, FiArrowLeft, FiEdit, FiTrash2,
} from 'react-icons/fi';

function TOC({ content }) {
  const headings = [];
  const re = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  let m;
  while ((m = re.exec(content)) !== null)
    headings.push({ level:parseInt(m[1]), text:m[2].replace(/<[^>]+>/g,'') });
  if (headings.length < 2) return null;
  return (
    <div className="p-5 rounded-2xl mb-8"
      style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
      <h3 className="font-bold text-sm mb-3" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>
        📋 Table of Contents
      </h3>
      <ul className="space-y-1.5">
        {headings.map((h,i)=>(
          <li key={i} className={h.level===3?'ml-4':''}>
            <a href={`#h${i}`} className="text-sm transition-colors" style={{ color:'#A78BFA' }}
              onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
              onMouseLeave={e=>e.currentTarget.style.color='#A78BFA'}
            >{h.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const { blog, loading, fetchBlog } = useBlogs();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [liked,      setLiked]      = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [related,    setRelated]    = useState([]);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    fetchBlog(slug).then(b => {
      if (!b) return;
      setLiked(b.likes?.includes(user?._id)||b.liked||false);
      setLikesCount(b.likesCount??b.likes?.length??0);
      if (b.category?._id||b.categoryId) {
        api.get('/blogs',{ params:{ category:b.category?.slug, status:'published', limit:4 } })
          .then(r=>setRelated((r.data.blogs||[]).filter(rb=>rb._id!==b._id).slice(0,3)))
          .catch(()=>{});
      }
    });
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Please login to like posts'); navigate('/login'); return; }
    const prev = liked;
    setLiked(!prev); setLikesCount(c=>prev?c-1:c+1);
    try { await api.post(`/blogs/${blog._id}/like`); }
    catch { setLiked(prev); setLikesCount(c=>prev?c+1:c-1); }
  };

  const handleShare = platform => {
    const url = window.location.href;
    if (platform==='twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog?.title)}&url=${encodeURIComponent(url)}`);
    else if (platform==='linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog?')) return;
    setDeleting(true);
    try { await api.delete(`/blogs/${blog._id}`); toast.success('Deleted'); navigate('/dashboard'); }
    catch { toast.error('Failed to delete'); setDeleting(false); }
  };

  const isOwner = user && blog && (blog.author?._id===user._id||user.role==='admin');

  if (loading) return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-5">
        <div className="skeleton h-8 w-3/4 rounded-xl"/>
        <div className="skeleton rounded-2xl" style={{ height:320 }}/>
        <div className="skeleton h-4 w-full rounded"/><div className="skeleton h-4 w-5/6 rounded"/>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#FDF6EC' }}>
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
          Blog Not Found
        </h2>
        <Link to="/blogs" className="btn-primary">Browse Blogs</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>

      {/* Cover hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={blog.coverImage||`https://picsum.photos/seed/${blog._id}/1200/500`}
          alt={blog.title} className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(26,11,46,0.85),rgba(26,11,46,0.3),transparent)' }}/>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-4xl mx-auto">
          <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors"
            style={{ color:'rgba(245,236,216,0.7)' }}
            onMouseEnter={e=>e.currentTarget.style.color='#F5ECD8'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.7)'}
          >
            <FiArrowLeft className="w-4 h-4"/> Back to Blogs
          </Link>
          {blog.category && (
            <span className="badge text-white mb-3 block w-fit text-xs"
              style={{ background:blog.category.color||'#6D28D9' }}>
              {blog.category.icon} {blog.category.name}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight"
            style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
            {blog.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 rounded-2xl px-6 py-4"
          style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
          <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-3 group">
            <img
              src={blog.author?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.name||'A')}&background=2A1250&color=F5ECD8`}
              alt={blog.author?.name} className="w-10 h-10 rounded-full object-cover"
              style={{ border:'2px solid rgba(167,139,250,0.4)' }}
            />
            <div>
              <p className="font-semibold text-sm transition-colors" style={{ color:'#F5ECD8' }}
                onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
                onMouseLeave={e=>e.currentTarget.style.color='#F5ECD8'}
              >{blog.author?.name}</p>
              <p className="text-xs" style={{ color:'rgba(245,236,216,0.4)' }}>
                {blog.createdAt?format(new Date(blog.createdAt),'MMM d, yyyy'):''}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-sm" style={{ color:'rgba(245,236,216,0.5)' }}>
            <span className="flex items-center gap-1"><FiClock className="w-4 h-4"/> {blog.readTime||1} min read</span>
            <span className="flex items-center gap-1"><FiEye className="w-4 h-4"/> {blog.views||0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Article */}
          <article className="lg:col-span-3">
            <TOC content={blog.content||''}/>

            {/* Blog content on white/cream background */}
            <div className="p-8 rounded-2xl mb-8"
              style={{ background:'#FFFFFF', border:'1px solid rgba(109,40,217,0.10)', boxShadow:'0 2px 16px rgba(109,40,217,0.06)' }}>
              <div className="prose-content" dangerouslySetInnerHTML={{ __html:blog.content||'<p>No content</p>' }}/>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map(tag=><span key={tag} className="tag-chip">#{tag}</span>)}
              </div>
            )}

            {/* Like + Share */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl mb-8"
              style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={handleLike}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={liked
                  ? { background:'rgba(239,68,68,0.15)', color:'#F87171', border:'1px solid rgba(239,68,68,0.3)' }
                  : { background:'rgba(255,255,255,0.06)', color:'rgba(245,236,216,0.7)', border:'1px solid rgba(255,255,255,0.10)' }
                }
                onMouseEnter={e=>{ if(!liked){ e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#F87171'; }}}
                onMouseLeave={e=>{ if(!liked){ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(245,236,216,0.7)'; }}}
              >
                <FiHeart className={`w-4 h-4 ${liked?'fill-current':''}`}/>
                {liked?'Liked':'Like'} · {likesCount}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm flex items-center gap-1" style={{ color:'rgba(245,236,216,0.45)' }}>
                  <FiShare2 className="w-4 h-4"/> Share:
                </span>
                {[
                  { p:'twitter',  icon:<FiTwitter/>,  color:'#38BDF8' },
                  { p:'linkedin', icon:<FiLinkedin/>,  color:'#60A5FA' },
                  { p:'copy',     icon:<FiLink/>,      color:'rgba(245,236,216,0.6)' },
                ].map(s=>(
                  <button key={s.p} onClick={()=>handleShare(s.p)}
                    className="p-2 rounded-lg transition-colors" style={{ color:s.color }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}
                  >{s.icon}</button>
                ))}
              </div>
            </div>

            {/* Author card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl mb-6"
              style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
              <img
                src={blog.author?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.name||'A')}&background=2A1250&color=F5ECD8`}
                alt={blog.author?.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                style={{ border:'2px solid rgba(167,139,250,0.3)' }}
              />
              <div className="flex-1">
                <p className="font-bold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{blog.author?.name}</p>
                <p className="text-sm mt-1 line-clamp-2" style={{ color:'rgba(245,236,216,0.5)' }}>
                  {blog.author?.bio||'Writer at BlogVerse AI'}
                </p>
              </div>
              <Link to={`/profile/${blog.author?._id}`} className="btn-secondary text-sm py-2 px-4 flex-shrink-0">
                View Profile
              </Link>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-3 mb-6">
                <Link to={`/edit/${blog._id}`} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                  <FiEdit className="w-4 h-4"/> Edit
                </Link>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ color:'#F87171', border:'1px solid rgba(248,113,113,0.3)', background:'rgba(248,113,113,0.06)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.12)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(248,113,113,0.06)'}
                >
                  <FiTrash2 className="w-4 h-4"/> {deleting?'Deleting...':'Delete'}
                </button>
              </div>
            )}

            {/* Comments */}
            <div className="mt-10">
              <CommentSection blogId={blog._id}/>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-2xl overflow-hidden"
                style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                  <h3 className="font-bold text-sm" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>Related Articles</h3>
                </div>
                <div className="p-4">
                  {related.length > 0 ? (
                    <ul className="space-y-4">
                      {related.map(r=>(
                        <li key={r._id}>
                          <Link to={`/blog/${r.slug}`} className="group">
                            <img src={r.coverImage||`https://picsum.photos/seed/${r._id}/400/200`}
                              alt={r.title} className="w-full h-24 object-cover rounded-xl mb-2"/>
                            <p className="text-sm font-semibold line-clamp-2 transition-colors"
                              style={{ color:'rgba(245,236,216,0.85)' }}
                              onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
                              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.85)'}
                            >{r.title}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm" style={{ color:'rgba(245,236,216,0.35)' }}>No related articles</p>}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
