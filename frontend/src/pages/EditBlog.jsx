import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlogs } from '../hooks/useBlogs';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiSend, FiX, FiTag, FiImage, FiLoader } from 'react-icons/fi';

const MODULES = {
  toolbar: [
    [{ header:[1,2,3,false] }],['bold','italic','underline','strike'],
    [{ list:'ordered' },{ list:'bullet' }],['blockquote','code-block'],
    ['link','image'],['clean'],
  ],
};

export default function EditBlog() {
  const { id } = useParams();
  const { updateBlog, loading } = useBlogs();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ title:'',content:'',excerpt:'',coverImage:'',category:'',status:'draft' });
  const [tags,      setTags]    = useState([]);
  const [tagInput,  setTagInput]= useState('');
  const [categories,setCategories]=useState([]);
  const [fetching,  setFetching]= useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [blogRes,catRes] = await Promise.all([api.get(`/blogs/id/${id}`), api.get('/categories')]);
        const b = blogRes.data.blog;
        setForm({ title:b.title||'', content:b.content||'', excerpt:b.excerpt||'', coverImage:b.coverImage||'', category:b.category?._id||b.category||'', status:b.status||'draft' });
        setTags(b.tags||[]);
        setCategories(catRes.data.categories||[]);
      } catch { toast.error('Failed to load blog'); navigate('/dashboard'); }
      finally { setFetching(false); }
    };
    load();
  }, [id]);

  const handleChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const addTag = () => { const t=tagInput.trim().toLowerCase(); if(t&&!tags.includes(t)&&tags.length<8){setTags(p=>[...p,t]);setTagInput('');} };
  const handleKey = e => { if(e.key==='Enter'||e.key===','){e.preventDefault();addTag();} };

  const handleSubmit = async status => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    if (!form.content.trim()) { toast.error('Content required'); return; }
    try { const blog = await updateBlog(id,{...form,tags,status}); navigate(`/blog/${blog.slug}`); }
    catch {}
  };

  const panelStyle = { background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 };
  const headStyle  = { background:'linear-gradient(135deg,#2A1250,#1E0D3A)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0.875rem 1.25rem' };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#FDF6EC' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
          style={{ borderColor:'rgba(109,40,217,0.15)', borderTopColor:'#6D28D9' }}/>
        <p style={{ color:'#7C5FA8' }}>Loading blog...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8" style={{ background:'#FDF6EC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>Edit Blog</h1>
            <p className="mt-1" style={{ color:'#7C5FA8' }}>Update your article</p>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>handleSubmit('draft')} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
              <FiSave/> Save Draft
            </button>
            <button onClick={()=>handleSubmit('published')} disabled={loading} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
              {loading?<FiLoader className="w-4 h-4 animate-spin"/>:<FiSend/>} Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold" style={{ color:'rgba(245,236,216,0.5)' }}>TITLE</span></div>
              <div className="p-5">
                <input name="title" value={form.title} onChange={handleChange} placeholder="Blog title..."
                  className="w-full text-2xl font-bold bg-transparent outline-none"
                  style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}/>
              </div>
            </div>
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold" style={{ color:'rgba(245,236,216,0.5)' }}>EXCERPT</span></div>
              <div className="p-5">
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2}
                  placeholder="Short summary..." className="w-full text-sm bg-transparent outline-none resize-none"
                  style={{ color:'rgba(245,236,216,0.8)' }}/>
              </div>
            </div>
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold" style={{ color:'rgba(245,236,216,0.5)' }}>CONTENT</span></div>
              <div className="p-5">
                <ReactQuill theme="snow" value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} modules={MODULES}/>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold flex items-center gap-1.5" style={{ color:'rgba(245,236,216,0.5)' }}><FiImage className="w-3.5 h-3.5"/> COVER IMAGE</span></div>
              <div className="p-5">
                <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." className="input-dark text-sm w-full"/>
                {form.coverImage && <img src={form.coverImage} alt="Preview" className="mt-3 w-full h-32 object-cover rounded-xl" onError={e=>e.target.style.display='none'}/>}
              </div>
            </div>
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold" style={{ color:'rgba(245,236,216,0.5)' }}>CATEGORY</span></div>
              <div className="p-5">
                <select name="category" value={form.category} onChange={handleChange} className="input-dark text-sm w-full">
                  <option value="">Select category...</option>
                  {categories.map(c=><option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold flex items-center gap-1.5" style={{ color:'rgba(245,236,216,0.5)' }}><FiTag className="w-3.5 h-3.5"/> TAGS</span></div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map(tag=>(
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background:'rgba(109,40,217,0.3)', color:'#C4B5FD', border:'1px solid rgba(109,40,217,0.4)' }}>
                      #{tag}<button onClick={()=>setTags(p=>p.filter(t=>t!==tag))}><FiX className="w-3 h-3"/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="Add tag + Enter" className="input-dark text-sm flex-1"/>
                  <button onClick={addTag} className="btn-primary text-sm px-3 py-2">Add</button>
                </div>
              </div>
            </div>
            <div style={panelStyle} className="overflow-hidden">
              <div style={headStyle}><span className="text-xs font-semibold" style={{ color:'rgba(245,236,216,0.5)' }}>STATUS</span></div>
              <div className="p-5">
                <div className="flex rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                  {['draft','published'].map(s=>(
                    <button key={s} onClick={()=>setForm(f=>({...f,status:s}))}
                      className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
                      style={form.status===s
                        ?{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#F5ECD8' }
                        :{ color:'rgba(245,236,216,0.5)' }
                      }>
                      {s==='draft'?'📝 Draft':'🚀 Published'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
