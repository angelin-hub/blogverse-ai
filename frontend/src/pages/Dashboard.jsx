import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiEdit, FiTrash2, FiEye, FiHeart, FiBookOpen,
  FiUsers, FiPenTool, FiTrendingUp, FiGlobe, FiLock, FiSave, FiCamera,
} from 'react-icons/fi';

function StatCard({ icon, label, value, accent }) {
  return (
    <motion.div whileHover={{ y:-4 }} transition={{ type:'spring', stiffness:300 }}
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 4px 16px rgba(30,13,58,0.12)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background:accent||'rgba(109,40,217,0.25)' }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{value}</p>
        <p className="text-xs" style={{ color:'rgba(245,236,216,0.45)' }}>{label}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [blogs,      setBlogs]      = useState([]);
  const [stats,      setStats]      = useState({ posts:0, views:0, likes:0, followers:0 });
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('all');
  const [deleting,   setDeleting]   = useState('');
  const [editMode,   setEditMode]   = useState(false);
  const [profileForm,setProfileForm]= useState({ name:user?.name||'', bio:user?.bio||'', avatar:user?.avatar||'' });
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    api.get('/blogs',{ params:{ author:user._id, limit:50 } })
      .then(r => {
        const data = r.data.blogs||[];
        setBlogs(data);
        setStats({
          posts:     data.length,
          views:     data.reduce((a,b)=>a+(b.views||0),0),
          likes:     data.reduce((a,b)=>a+(b.likesCount||b.likes?.length||0),0),
          followers: user?.followers?.length||0,
        });
      }).catch(()=>toast.error('Failed to load blogs'))
      .finally(()=>setLoading(false));
  }, [user]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this blog?')) return;
    setDeleting(id);
    try { await api.delete(`/blogs/${id}`); setBlogs(p=>p.filter(b=>b._id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
    finally { setDeleting(''); }
  };

  const toggleStatus = async blog => {
    const ns = blog.status==='published'?'draft':'published';
    try {
      await api.put(`/blogs/${blog._id}`,{status:ns});
      setBlogs(p=>p.map(b=>b._id===blog._id?{...b,status:ns}:b));
      toast.success(ns==='published'?'Published!':'Moved to drafts');
    } catch { toast.error('Failed'); }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated! ✨');
      setEditMode(false);
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const published = blogs.filter(b=>b.status==='published');
  const drafts    = blogs.filter(b=>b.status==='draft');
  const filtered  = activeTab==='published'?published:activeTab==='drafts'?drafts:blogs;

  return (
    <div className="min-h-screen py-8" style={{ background:'#FDF6EC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
              Dashboard
            </h1>
            <p className="mt-1" style={{ color:'#7C5FA8' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </p>
          </div>
          <Link to="/create" className="btn-primary flex items-center gap-2 text-sm">
            <FiPenTool className="w-4 h-4"/> New Blog
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<FiBookOpen className="w-5 h-5" style={{ color:'#A78BFA' }}/>} label="Total Posts"  value={stats.posts}     accent="rgba(109,40,217,0.20)"/>
          <StatCard icon={<FiEye      className="w-5 h-5" style={{ color:'#60A5FA' }}/>} label="Total Views"  value={stats.views}     accent="rgba(96,165,250,0.20)"/>
          <StatCard icon={<FiHeart    className="w-5 h-5" style={{ color:'#F87171' }}/>} label="Total Likes"  value={stats.likes}     accent="rgba(248,113,113,0.20)"/>
          <StatCard icon={<FiUsers    className="w-5 h-5" style={{ color:'#4ADE80' }}/>} label="Followers"    value={stats.followers} accent="rgba(74,222,128,0.20)"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Posts table */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>

              {/* Tabs */}
              <div className="p-5" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id:'all',       l:`All (${blogs.length})` },
                    { id:'published', l:`Published (${published.length})` },
                    { id:'drafts',    l:`Drafts (${drafts.length})` },
                  ].map(t=>(
                    <button key={t.id} onClick={()=>setActiveTab(t.id)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      style={activeTab===t.id
                        ? { background:'rgba(109,40,217,0.35)', color:'#C4B5FD', border:'1px solid rgba(109,40,217,0.4)' }
                        : { color:'rgba(245,236,216,0.5)', background:'transparent' }
                      }
                      onMouseEnter={e=>{ if(activeTab!==t.id) e.currentTarget.style.color='rgba(245,236,216,0.8)'; }}
                      onMouseLeave={e=>{ if(activeTab!==t.id) e.currentTarget.style.color='rgba(245,236,216,0.5)'; }}
                    >{t.l}</button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-8 space-y-4">
                  {[1,2,3].map(i=>(
                    <div key={i} className="flex gap-4 items-center">
                      <div className="skeleton h-12 w-16 rounded-xl flex-shrink-0"/>
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4 rounded"/><div className="skeleton h-3 w-1/2 rounded"/>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length===0 ? (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-semibold mb-4" style={{ color:'#F5ECD8' }}>No posts here</p>
                  <Link to="/create" className="btn-primary text-sm">Create your first post</Link>
                </div>
              ) : (
                <div>
                  {filtered.map(blog=>(
                    <div key={blog._id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors"
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}
                    >
                      <img src={blog.coverImage||`https://picsum.photos/seed/${blog._id}/80/60`}
                        alt={blog.title} className="w-14 h-10 rounded-xl object-cover flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <Link to={`/blog/${blog.slug}`}
                          className="font-semibold text-sm line-clamp-1 transition-colors"
                          style={{ color:'rgba(245,236,216,0.9)' }}
                          onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
                          onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.9)'}
                        >{blog.title}</Link>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color:'rgba(245,236,216,0.35)' }}>
                          <span>{blog.createdAt?format(new Date(blog.createdAt),'MMM d, yyyy'):''}</span>
                          <span className="flex items-center gap-0.5"><FiEye className="w-3 h-3"/> {blog.views||0}</span>
                          <span className="flex items-center gap-0.5"><FiHeart className="w-3 h-3"/> {blog.likesCount||0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={()=>toggleStatus(blog)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
                          style={blog.status==='published'
                            ? { background:'rgba(74,222,128,0.15)', color:'#4ADE80', border:'1px solid rgba(74,222,128,0.25)' }
                            : { background:'rgba(255,255,255,0.08)', color:'rgba(245,236,216,0.55)', border:'1px solid rgba(255,255,255,0.1)' }
                          }
                        >
                          {blog.status==='published' ? <><FiGlobe className="w-3 h-3"/> Live</> : <><FiLock className="w-3 h-3"/> Draft</>}
                        </button>
                        <Link to={`/edit/${blog._id}`}
                          className="p-1.5 rounded-lg transition-all" style={{ color:'rgba(245,236,216,0.45)' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(109,40,217,0.25)'; e.currentTarget.style.color='#C4B5FD'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(245,236,216,0.45)'; }}
                        ><FiEdit className="w-4 h-4"/></Link>
                        <button onClick={()=>handleDelete(blog._id)} disabled={deleting===blog._id}
                          className="p-1.5 rounded-lg transition-all" style={{ color:'rgba(245,236,216,0.45)' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(248,113,113,0.15)'; e.currentTarget.style.color='#F87171'; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(245,236,216,0.45)'; }}
                        ><FiTrash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile sidebar */}
          <div className="space-y-5">

            {/* Profile card */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                <h3 className="font-bold text-sm" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>Profile</h3>
                <button onClick={()=>setEditMode(v=>!v)} className="text-xs font-semibold" style={{ color:'#A78BFA' }}>
                  {editMode?'Cancel':'Edit'}
                </button>
              </div>
              <div className="p-5">
                {editMode ? (
                  <div className="space-y-3">
                    {[
                      { l:'Name', key:'name', type:'text',  comp:'input' },
                      { l:'Bio',  key:'bio',  type:'text',  comp:'textarea' },
                    ].map(f=>(
                      <div key={f.key}>
                        <label className="text-xs font-semibold mb-1 block" style={{ color:'rgba(245,236,216,0.55)' }}>{f.l}</label>
                        {f.comp==='textarea'
                          ? <textarea value={profileForm[f.key]} rows={3}
                              onChange={e=>setProfileForm(p=>({...p,[f.key]:e.target.value}))}
                              className="input-dark resize-none text-sm w-full"/>
                          : <input type="text" value={profileForm[f.key]}
                              onChange={e=>setProfileForm(p=>({...p,[f.key]:e.target.value}))}
                              className="input-dark text-sm w-full"/>
                        }
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color:'rgba(245,236,216,0.55)' }}>
                        <FiCamera className="w-3 h-3"/> Avatar URL
                      </label>
                      <input type="text" value={profileForm.avatar}
                        onChange={e=>setProfileForm(p=>({...p,avatar:e.target.value}))}
                        className="input-dark text-sm w-full" placeholder="https://..."/>
                    </div>
                    <button onClick={handleProfileSave} disabled={saving}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                      {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"/> : <FiSave/>}
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={user?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=2A1250&color=F5ECD8&size=80`}
                      alt={user?.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3"
                      style={{ border:'2px solid rgba(167,139,250,0.3)' }}
                    />
                    <p className="font-bold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{user?.name}</p>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color:'rgba(245,236,216,0.45)' }}>{user?.bio||'No bio yet'}</p>
                    <Link to={`/profile/${user?._id}`} className="mt-3 inline-block text-xs font-medium" style={{ color:'#A78BFA' }}>
                      View Public Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-3.5"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                <h3 className="font-bold text-sm flex items-center gap-2"
                  style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                  <FiTrendingUp style={{ color:'#A78BFA' }}/> Quick Stats
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { l:'Published', v:published.length },
                  { l:'Drafts',    v:drafts.length },
                ].map(s=>(
                  <div key={s.l} className="flex justify-between items-center">
                    <span className="text-sm" style={{ color:'rgba(245,236,216,0.55)' }}>{s.l}</span>
                    <span className="font-bold" style={{ color:'#F5ECD8' }}>{s.v}</span>
                  </div>
                ))}
                <div className="w-full rounded-full h-2 mt-1" style={{ background:'rgba(255,255,255,0.08)' }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width:blogs.length?`${(published.length/blogs.length)*100}%`:'0%', background:'linear-gradient(90deg,#6D28D9,#8B5CF6)' }}/>
                </div>
                <p className="text-xs" style={{ color:'rgba(245,236,216,0.35)' }}>
                  {blogs.length?Math.round((published.length/blogs.length)*100):0}% published
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
