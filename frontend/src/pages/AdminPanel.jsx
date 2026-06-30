import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUsers, FiBookOpen, FiMessageSquare, FiEye, FiShield, FiTag, FiTrash2, FiEdit, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const NAVS = [
  { id:'overview',   label:'Overview',   icon:<FiShield/> },
  { id:'users',      label:'Users',      icon:<FiUsers/> },
  { id:'blogs',      label:'Blogs',      icon:<FiBookOpen/> },
  { id:'categories', label:'Categories', icon:<FiTag/> },
];

function StatCard({ label, value, icon, accent }) {
  return (
    <motion.div whileHover={{ y:-3 }}
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 4px 16px rgba(30,13,58,0.12)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:accent }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{value??'—'}</p>
        <p className="text-xs" style={{ color:'rgba(245,236,216,0.4)' }}>{label}</p>
      </div>
    </motion.div>
  );
}

/* Reusable dark table card */
const TableCard = ({ children }) => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)' }}>
    {children}
  </div>
);

export default function AdminPanel() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [section,    setSection]    = useState('overview');
  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [blogs,      setBlogs]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [catForm,    setCatForm]    = useState({ name:'', description:'', color:'#6D28D9', icon:'📝' });
  const [editCat,    setEditCat]    = useState(null);

  if (!isAuthenticated||!isAdmin) return <Navigate to="/" replace/>;

  useEffect(() => { loadSection(section); }, [section]);

  const loadSection = async s => {
    setLoading(true);
    try {
      if (s==='overview') { const {data}=await api.get('/admin/stats'); setStats(data); }
      else if (s==='users') { const {data}=await api.get('/admin/users'); setUsers(data.users||[]); }
      else if (s==='blogs') { const {data}=await api.get('/blogs',{params:{limit:50}}); setBlogs(data.blogs||[]); }
      else if (s==='categories') { const {data}=await api.get('/categories'); setCategories(data.categories||[]); }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const setUserRole = async (id,role) => {
    try { await api.put(`/admin/users/${id}/role`,{role}); setUsers(p=>p.map(u=>u._id===id?{...u,role}:u)); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  const deleteBlog = async id => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/blogs/${id}`); setBlogs(p=>p.filter(b=>b._id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const saveCat = async () => {
    if (!catForm.name.trim()) { toast.error('Name required'); return; }
    try {
      if (editCat) {
        const {data}=await api.put(`/categories/${editCat._id}`,catForm);
        setCategories(p=>p.map(c=>c._id===editCat._id?data.category:c));
        toast.success('Updated');
      } else {
        const {data}=await api.post('/categories',catForm);
        setCategories(p=>[...p,data.category]);
        toast.success('Created');
      }
      setCatForm({ name:'',description:'',color:'#6D28D9',icon:'📝' }); setEditCat(null);
    } catch { toast.error('Failed'); }
  };

  const deleteCat = async id => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/categories/${id}`); setCategories(p=>p.filter(c=>c._id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const thStyle = { color:'rgba(245,236,216,0.4)', fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', padding:'0.75rem 1rem', textAlign:'left' };
  const tdStyle = { padding:'0.75rem 1rem', color:'rgba(245,236,216,0.7)', fontSize:'0.875rem', borderTop:'1px solid rgba(255,255,255,0.05)' };

  return (
    <div className="min-h-screen flex" style={{ background:'#FDF6EC' }}>

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 hidden md:flex flex-col py-8 px-4"
        style={{ background:'#1A0B2E', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)' }}>
            <HiSparkles className="w-4 h-4 text-white"/>
          </span>
          <span className="font-bold text-sm" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>
            Admin Panel
          </span>
        </div>
        <nav className="space-y-1">
          {NAVS.map(item=>(
            <button key={item.id} onClick={()=>setSection(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={section===item.id
                ? { background:'rgba(109,40,217,0.35)', color:'#C4B5FD', border:'1px solid rgba(109,40,217,0.4)' }
                : { color:'rgba(245,236,216,0.55)', background:'transparent' }
              }
              onMouseEnter={e=>{ if(section!==item.id){ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(245,236,216,0.85)'; }}}
              onMouseLeave={e=>{ if(section!==item.id){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(245,236,216,0.55)'; }}}
            >
              <span style={{ color: section===item.id?'#A78BFA':'rgba(245,236,216,0.4)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ background:'#1A0B2E', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        {NAVS.map(item=>(
          <button key={item.id} onClick={()=>setSection(item.id)}
            className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors"
            style={{ color: section===item.id?'#A78BFA':'rgba(245,236,216,0.4)' }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 pb-24 md:pb-6">
        <motion.div key={section}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}>

          {/* Overview */}
          {section==='overview' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>Overview</h1>
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i=><div key={i} className="skeleton rounded-2xl h-24"/>)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Total Users"  value={stats?.totalUsers}    icon={<FiUsers       className="w-5 h-5" style={{color:'#A78BFA'}}/>} accent="rgba(109,40,217,0.2)"/>
                  <StatCard label="Total Blogs"  value={stats?.totalBlogs}    icon={<FiBookOpen    className="w-5 h-5" style={{color:'#60A5FA'}}/>} accent="rgba(96,165,250,0.2)"/>
                  <StatCard label="Comments"     value={stats?.totalComments} icon={<FiMessageSquare className="w-5 h-5" style={{color:'#4ADE80'}}/>} accent="rgba(74,222,128,0.2)"/>
                  <StatCard label="Total Views"  value={stats?.totalViews}    icon={<FiEye         className="w-5 h-5" style={{color:'#F87171'}}/>} accent="rgba(248,113,113,0.2)"/>
                </div>
              )}
              {stats?.blogsByCategory && (
                <TableCard>
                  <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                    <h3 className="font-bold text-sm" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>Blogs by Category</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    {stats.blogsByCategory.slice(0,6).map((cat,i)=>(
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color:'rgba(245,236,216,0.65)' }}>{cat._id||'Uncategorized'}</span>
                          <span className="font-bold" style={{ color:'#F5ECD8' }}>{cat.count}</span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background:'rgba(255,255,255,0.08)' }}>
                          <div className="h-1.5 rounded-full" style={{ width:`${Math.min(100,(cat.count/(stats.totalBlogs||1))*100)}%`, background:'linear-gradient(90deg,#6D28D9,#8B5CF6)' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCard>
              )}
            </div>
          )}

          {/* Users */}
          {section==='users' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
                Users <span className="text-base font-normal" style={{ color:'#7C5FA8' }}>({users.length})</span>
              </h1>
              {loading
                ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
                : (
                  <TableCard>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Joined</th>
                            <th style={thStyle}>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u=>(
                            <tr key={u._id}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                              onMouseLeave={e=>e.currentTarget.style.background=''}
                            >
                              <td style={tdStyle}>
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2A1250&color=F5ECD8`}
                                    alt={u.name} className="w-8 h-8 rounded-lg object-cover"/>
                                  <span className="font-medium">{u.name}</span>
                                </div>
                              </td>
                              <td style={{ ...tdStyle, color:'rgba(245,236,216,0.5)' }}>{u.email}</td>
                              <td style={{ ...tdStyle, color:'rgba(245,236,216,0.5)' }}>
                                {u.createdAt?format(new Date(u.createdAt),'MMM d, yyyy'):'—'}
                              </td>
                              <td style={tdStyle}>
                                <select value={u.role} onChange={e=>setUserRole(u._id,e.target.value)}
                                  className="text-xs rounded-lg px-2 py-1 outline-none"
                                  style={{ background:'rgba(109,40,217,0.25)', border:'1px solid rgba(109,40,217,0.35)', color:'#C4B5FD' }}>
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TableCard>
                )
              }
            </div>
          )}

          {/* Blogs */}
          {section==='blogs' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
                Blogs <span className="text-base font-normal" style={{ color:'#7C5FA8' }}>({blogs.length})</span>
              </h1>
              {loading
                ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
                : (
                  <TableCard>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                            <th style={thStyle}>Title</th>
                            <th style={thStyle}>Author</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Views</th>
                            <th style={{ ...thStyle, textAlign:'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogs.map(blog=>(
                            <tr key={blog._id}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                              onMouseLeave={e=>e.currentTarget.style.background=''}
                            >
                              <td style={tdStyle}>
                                <Link to={`/blog/${blog.slug}`} className="font-medium line-clamp-1 max-w-xs block transition-colors"
                                  style={{ color:'rgba(245,236,216,0.85)' }}
                                  onMouseEnter={e=>e.currentTarget.style.color='#C4B5FD'}
                                  onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.85)'}
                                >{blog.title}</Link>
                              </td>
                              <td style={{ ...tdStyle, color:'rgba(245,236,216,0.5)' }}>{blog.author?.name||'—'}</td>
                              <td style={tdStyle}>
                                <span className="badge text-xs"
                                  style={blog.status==='published'
                                    ? { background:'rgba(74,222,128,0.15)', color:'#4ADE80', border:'1px solid rgba(74,222,128,0.25)' }
                                    : { background:'rgba(255,255,255,0.08)', color:'rgba(245,236,216,0.5)' }
                                  }>{blog.status}</span>
                              </td>
                              <td style={{ ...tdStyle, color:'rgba(245,236,216,0.5)' }}>{blog.views||0}</td>
                              <td style={{ ...tdStyle, textAlign:'center' }}>
                                <button onClick={()=>deleteBlog(blog._id)}
                                  className="p-1.5 rounded-lg transition-all" style={{ color:'rgba(245,236,216,0.4)' }}
                                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(248,113,113,0.15)'; e.currentTarget.style.color='#F87171'; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(245,236,216,0.4)'; }}
                                ><FiTrash2 className="w-4 h-4"/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TableCard>
                )
              }
            </div>
          )}

          {/* Categories */}
          {section==='categories' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>Categories</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Form */}
                <TableCard>
                  <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                    <h3 className="font-bold text-sm flex items-center gap-2" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>
                      <FiPlus style={{ color:'#A78BFA' }}/> {editCat?'Edit Category':'New Category'}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { l:'Name',        k:'name',        t:'text',  ph:'Technology' },
                      { l:'Description', k:'description', t:'text',  ph:'All things tech...' },
                    ].map(f=>(
                      <div key={f.k}>
                        <label className="text-xs font-semibold mb-1 block" style={{ color:'rgba(245,236,216,0.55)' }}>{f.l}</label>
                        <input type="text" value={catForm[f.k]} placeholder={f.ph}
                          onChange={e=>setCatForm(p=>({...p,[f.k]:e.target.value}))}
                          className="input-dark w-full text-sm"/>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color:'rgba(245,236,216,0.55)' }}>Icon (emoji)</label>
                        <input type="text" value={catForm.icon} placeholder="💻"
                          onChange={e=>setCatForm(p=>({...p,icon:e.target.value}))}
                          className="input-dark w-full text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color:'rgba(245,236,216,0.55)' }}>Color</label>
                        <input type="color" value={catForm.color}
                          onChange={e=>setCatForm(p=>({...p,color:e.target.value}))}
                          className="w-full h-10 rounded-xl cursor-pointer border-0"
                          style={{ background:'transparent' }}/>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={saveCat} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                        <FiCheck/> {editCat?'Update':'Create'}
                      </button>
                      {editCat && (
                        <button onClick={()=>{ setEditCat(null); setCatForm({name:'',description:'',color:'#6D28D9',icon:'📝'}); }}
                          className="p-2.5 rounded-xl text-sm transition-all"
                          style={{ background:'rgba(255,255,255,0.06)', color:'rgba(245,236,216,0.7)', border:'1px solid rgba(255,255,255,0.10)' }}>
                          <FiX/>
                        </button>
                      )}
                    </div>
                  </div>
                </TableCard>

                {/* List */}
                <TableCard>
                  <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,#2A1250,#1E0D3A)' }}>
                    <h3 className="font-bold text-sm" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>
                      All Categories ({categories.length})
                    </h3>
                  </div>
                  <div className="p-4">
                    {loading
                      ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-10 rounded-xl"/>)}</div>
                      : categories.length===0
                      ? <p className="text-sm" style={{ color:'rgba(245,236,216,0.35)' }}>No categories yet.</p>
                      : (
                        <ul className="space-y-2">
                          {categories.map(cat=>(
                            <li key={cat._id}
                              className="flex items-center justify-between p-3 rounded-xl transition-colors"
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                              onMouseLeave={e=>e.currentTarget.style.background=''}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
                                  style={{ background:`${cat.color||'#6D28D9'}25` }}>
                                  {cat.icon}
                                </span>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color:'#F5ECD8' }}>{cat.name}</p>
                                  <p className="text-xs" style={{ color:'rgba(245,236,216,0.35)' }}>{cat.postCount||0} posts</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={()=>{ setEditCat(cat); setCatForm({name:cat.name,description:cat.description||'',color:cat.color||'#6D28D9',icon:cat.icon||'📝'}); }}
                                  className="p-1.5 rounded-lg transition-all" style={{ color:'rgba(245,236,216,0.4)' }}
                                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(109,40,217,0.25)'; e.currentTarget.style.color='#A78BFA'; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(245,236,216,0.4)'; }}
                                ><FiEdit className="w-3.5 h-3.5"/></button>
                                <button onClick={()=>deleteCat(cat._id)}
                                  className="p-1.5 rounded-lg transition-all" style={{ color:'rgba(245,236,216,0.4)' }}
                                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(248,113,113,0.15)'; e.currentTarget.style.color='#F87171'; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(245,236,216,0.4)'; }}
                                ><FiTrash2 className="w-3.5 h-3.5"/></button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    }
                  </div>
                </TableCard>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
