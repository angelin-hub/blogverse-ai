import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogs } from '../hooks/useBlogs';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

import {
  FiSave, FiSend, FiX, FiLoader, FiEye, FiEyeOff,
  FiUpload, FiImage, FiTag, FiClock, FiAlertCircle,
  FiCheckCircle, FiRefreshCw, FiSmile, FiMonitor, FiSmartphone,
  FiStar, FiMessageSquare, FiCalendar, FiZap, FiTrendingUp,
  FiCopy, FiCheck,
} from 'react-icons/fi';
import { HiSparkles, HiOutlineLightBulb } from 'react-icons/hi';
import { BsRobot, BsTextParagraph } from 'react-icons/bs';

/* ── Quill config ── */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1,2,3,4,false] }],
    ['bold','italic','underline','strike'],
    [{ color:[] },{ background:[] }],
    [{ list:'ordered'},{ list:'bullet' }],
    [{ indent:'-1'},{ indent:'+1' }],
    ['blockquote','code-block'],
    ['link','image','video'],
    [{ align:[] }],
    ['clean'],
  ],
};
const QUILL_FORMATS = [
  'header','bold','italic','underline','strike','color','background',
  'list','bullet','indent','blockquote','code-block',
  'link','image','video','align',
];

/* ── helpers ── */
const wordCount = html => html.replace(/<[^>]*>/g,'').trim().split(/\s+/).filter(Boolean).length;
const readTime  = wc  => Math.max(1, Math.ceil(wc / 200));

const EMOJIS = ['😊','🔥','💡','🚀','✨','🎯','📚','🌟','💪','🎨','🤖','💻','🌍','❤️','👏','🎉','📝','💬','🔑','⚡'];

const PANEL = {
  background:'rgba(26,11,46,0.85)',
  backdropFilter:'blur(20px)',
  WebkitBackdropFilter:'blur(20px)',
  border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:18,
  boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
};
const HEAD = {
  background:'linear-gradient(135deg,rgba(109,40,217,0.35),rgba(42,18,80,0.6))',
  borderBottom:'1px solid rgba(255,255,255,0.07)',
  padding:'0.8rem 1.25rem',
  display:'flex', alignItems:'center', gap:'0.5rem',
};
const LABEL = { fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(245,236,216,0.45)' };

/* ── SEO Score ── */
function seoScore(title, content, tags, excerpt) {
  let s = 0;
  if (title.length >= 30 && title.length <= 70) s += 25;
  else if (title.length > 0) s += 10;
  const wc = wordCount(content);
  if (wc >= 300) s += 25;
  else if (wc > 0) s += Math.floor((wc / 300) * 25);
  if (excerpt.length >= 100) s += 20;
  else if (excerpt.length > 0) s += 10;
  if (tags.length >= 3) s += 20;
  else s += tags.length * 6;
  if (content.includes('<h2>') || content.includes('<h3>')) s += 10;
  return Math.min(100, s);
}

function seoColor(score) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

/* ── Engagement score (fun metric) ── */
function engScore(title, wc, tags) {
  let s = 0;
  if (wc >= 500) s += 40; else s += Math.floor((wc / 500) * 40);
  if (tags.length >= 3) s += 30; else s += tags.length * 10;
  if (title.length > 10) s += 30;
  return Math.min(100, s);
}

/* ── AI Tool Button ── */
function AIBtn({ icon, label, running, onClick, color = '#A78BFA' }) {
  return (
    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
      onClick={onClick} disabled={!!running}
      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
      style={{
        background:'rgba(255,255,255,0.05)',
        border:`1px solid rgba(109,40,217,0.25)`,
        color,
        opacity: running ? 0.6 : 1,
      }}
      onMouseEnter={e=>{ if(!running){ e.currentTarget.style.background='rgba(109,40,217,0.2)'; e.currentTarget.style.borderColor='rgba(109,40,217,0.5)'; }}}
      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(109,40,217,0.25)'; }}
    >
      {running ? <FiLoader className="w-4 h-4 animate-spin flex-shrink-0" style={{color}}/> : icon}
      {label}
    </motion.button>
  );
}

/* ── Result Box ── */
function ResultBox({ text, onApply, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25}}
      className="mt-3 rounded-xl overflow-hidden"
      style={{background:'rgba(109,40,217,0.12)',border:'1px solid rgba(109,40,217,0.25)'}}>
      <div className="px-3 py-2 flex items-center justify-between"
        style={{borderBottom:'1px solid rgba(109,40,217,0.15)',background:'rgba(109,40,217,0.15)'}}>
        <span className="text-xs font-bold" style={{color:'#A78BFA'}}>✨ AI Result</span>
        <div className="flex items-center gap-1">
          <button onClick={copy} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
            style={{color: copied?'#22C55E':'#A78BFA'}}>
            {copied ? <><FiCheck className="w-3 h-3"/> Copied</> : <><FiCopy className="w-3 h-3"/> Copy</>}
          </button>
          {onApply && (
            <button onClick={onApply} className="text-xs px-2 py-1 rounded-lg font-semibold"
              style={{background:'rgba(109,40,217,0.4)',color:'#F5ECD8'}}>
              Apply
            </button>
          )}
          <button onClick={onClose} style={{color:'rgba(245,236,216,0.35)'}}><FiX className="w-3.5 h-3.5"/></button>
        </div>
      </div>
      <div className="p-3 text-sm whitespace-pre-wrap leading-relaxed" style={{color:'rgba(245,236,216,0.8)',maxHeight:180,overflowY:'auto'}}>
        {text}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function CreateBlog() {
  const { createBlog, loading } = useBlogs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const dropRef  = useRef(null);
  const autoSaveRef = useRef(null);

  /* ── Form state ── */
  const [form, setForm] = useState({
    title:'', content:'', excerpt:'', coverImage:'', category:'', status:'draft',
  });
  const [tags,        setTags]        = useState([]);
  const [tagInput,    setTagInput]    = useState('');
  const [categories,  setCategories]  = useState([]);

  /* ── UI state ── */
  const [preview,     setPreview]     = useState(false);       // live preview
  const [previewMode, setPreviewMode] = useState('desktop');   // desktop | mobile
  const [showEmoji,   setShowEmoji]   = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [aiLoading,   setAiLoading]   = useState('');
  const [aiResult,    setAiResult]    = useState({ text:'', type:'' });
  const [autoSaved,   setAutoSaved]   = useState(null);
  const [featured,    setFeatured]    = useState(false);
  const [commentsOn,  setCommentsOn]  = useState(true);
  const [schedDate,   setSchedDate]   = useState('');
  const [schedOpen,   setSchedOpen]   = useState(false);
  const [activeTab,   setActiveTab]   = useState('write');     // write | preview

  /* ── Derived stats ── */
  const wc      = wordCount(form.content);
  const rt      = readTime(wc);
  const seo     = seoScore(form.title, form.content, tags, form.excerpt);
  const eng     = engScore(form.title, wc, tags);

  /* ── Load categories ── */
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  /* ── Auto-save every 30s ── */
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (form.title.trim() || form.content.trim()) {
        const draft = { form, tags, featured, commentsOn };
        localStorage.setItem('blogverse_draft', JSON.stringify(draft));
        setAutoSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [form, tags, featured, commentsOn]);

  /* ── Restore draft on mount ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blogverse_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.form?.title || d.form?.content) {
          toast('📝 Draft restored', { icon:'💾', duration:3000 });
          setForm(d.form);
          setTags(d.tags || []);
          setFeatured(d.featured || false);
          setCommentsOn(d.commentsOn !== false);
        }
      }
    } catch {}
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* ── Tags ── */
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g,'-');
    if (t && !tags.includes(t) && tags.length < 8) { setTags(p => [...p, t]); setTagInput(''); }
  };
  const removeTag = t => setTags(p => p.filter(x => x !== t));

  /* ── Drag & drop cover image ── */
  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setForm(f => ({ ...f, coverImage: url }));
      toast.success('Cover image set!');
    }
  };

  /* ── AI calls ── */
  const callAI = async (type) => {
    setAiLoading(type);
    setAiResult({ text:'', type });
    try {
      const plain = form.content.replace(/<[^>]*>/g,'').slice(0,800);
      const endpoints = {
        title:    { url:'/ai/suggest-titles',    body:{ topic: form.title || plain || 'blog post' } },
        ideas:    { url:'/ai/generate-ideas',    body:{ topic: form.title || 'blogging' } },
        improve:  { url:'/ai/writing-assistant', body:{ text: plain || form.title } },
        grammar:  { url:'/ai/writing-assistant', body:{ text: `Fix grammar and spelling:\n${plain}` } },
        summary:  { url:'/ai/summarize',         body:{ content: form.content || form.title } },
        tags:     { url:'/ai/chat',              body:{ message:`Suggest 5 SEO tags for a blog titled "${form.title}". Return ONLY a comma-separated list of tags, no explanation.` } },
        seo:      { url:'/ai/chat',              body:{ message:`Give 3 SEO improvement tips for a blog titled "${form.title}" with excerpt: "${form.excerpt}". Be concise.` } },
        write:    { url:'/ai/writing-assistant', body:{ text: `Continue writing this blog post:\n\nTitle: ${form.title}\n\n${plain.slice(0,400)}` } },
      };
      const ep = endpoints[type];
      if (!ep) return;
      const { data } = await api.post(ep.url, ep.body);
      const text = data.result || data.reply || data.summary || 'Done!';
      setAiResult({ text, type });
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI unavailable');
    } finally {
      setAiLoading(''); }
  };

  /* ── Apply AI result ── */
  const applyResult = () => {
    const { text, type } = aiResult;
    if (type === 'title') {
      const lines = text.split('\n').filter(l => l.trim());
      const first = lines[0]?.replace(/^\d+\.\s*/,'').replace(/^["']|["']$/g,'').trim();
      if (first) setForm(f => ({ ...f, title: first }));
    } else if (type === 'summary') {
      setForm(f => ({ ...f, excerpt: text.slice(0, 300) }));
    } else if (type === 'tags') {
      const newTags = text.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean).slice(0, 8);
      setTags(newTags);
    } else if (type === 'improve' || type === 'write' || type === 'grammar') {
      setForm(f => ({ ...f, content: f.content + '<p>' + text + '</p>' }));
    }
    toast.success('Applied!');
    setAiResult({ text: '', type: '' });
  };

  /* ── Save draft manually ── */
  const saveDraftLocally = () => {
    localStorage.setItem('blogverse_draft', JSON.stringify({ form, tags, featured, commentsOn }));
    setAutoSaved(new Date());
    toast.success('Draft saved locally!');
  };

  /* ── Submit ── */
  const handleSubmit = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim() || form.content === '<p><br></p>') { toast.error('Content is required'); return; }
    try {
      const payload = { ...form, tags, status, featured };
      if (schedDate && status === 'published') payload.scheduledAt = schedDate;
      const blog = await createBlog(payload);
      localStorage.removeItem('blogverse_draft');
      navigate(`/blog/${blog.slug}`);
    } catch {}
  };

  /* ══════════════════════════════════
     RENDER
  ══════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4"
        style={{ background:'rgba(253,246,236,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(109,40,217,0.10)', boxShadow:'0 2px 16px rgba(109,40,217,0.06)' }}>

        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-extrabold leading-none" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
              ✍️ Writing Studio
            </h1>
            <p className="text-xs mt-0.5" style={{ color:'#A78BCA' }}>
              {autoSaved ? `Auto-saved ${autoSaved.toLocaleTimeString()}` : 'Not saved yet'}
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background:'rgba(109,40,217,0.10)', color:'#6D28D9' }}>
            <BsTextParagraph className="w-3 h-3"/> {wc} words
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background:'rgba(109,40,217,0.10)', color:'#6D28D9' }}>
            <FiClock className="w-3 h-3"/> {rt} min read
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background:`${seoColor(seo)}18`, color:seoColor(seo) }}>
            SEO {seo}%
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab(t => t==='preview'?'write':'preview')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: activeTab==='preview'?'rgba(109,40,217,0.15)':'rgba(109,40,217,0.08)', border:'1.5px solid rgba(109,40,217,0.2)', color:'#6D28D9' }}>
            <FiEye className="w-4 h-4"/> {activeTab==='preview'?'Edit':'Preview'}
          </button>
          <button onClick={saveDraftLocally}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-secondary">
            <FiSave className="w-4 h-4"/> Save
          </button>
          <button onClick={() => handleSubmit('published')} disabled={loading}
            className="btn-primary flex items-center gap-1.5 text-sm px-5 py-2">
            {loading ? <FiLoader className="w-4 h-4 animate-spin"/> : <FiSend className="w-4 h-4"/>}
            Publish
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">

          {/* ════════════════════ WRITE TAB ════════════════════ */}
          {activeTab === 'write' && (
            <motion.div key="write"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.3 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* ── Left: Editor ── */}
              <div className="xl:col-span-2 space-y-5">

                {/* Cover image drag & drop */}
                <div ref={dropRef}
                  onDragOver={e=>{e.preventDefault();setDragging(true);}}
                  onDragLeave={()=>setDragging(false)}
                  onDrop={onDrop}
                  className="relative rounded-2xl overflow-hidden transition-all"
                  style={{
                    ...PANEL,
                    border: dragging ? '2px dashed #6D28D9' : '1px solid rgba(255,255,255,0.08)',
                    background: dragging ? 'rgba(109,40,217,0.15)' : PANEL.background,
                    minHeight: form.coverImage ? 'auto' : 120,
                  }}>
                  {form.coverImage ? (
                    <div className="relative">
                      <img src={form.coverImage} alt="Cover"
                        className="w-full object-cover" style={{ maxHeight:260 }}
                        onError={e=>e.target.style.display='none'}/>
                      <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(26,11,46,0.8),transparent)' }}/>
                      <button onClick={()=>setForm(f=>({...f,coverImage:''}))}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(239,68,68,0.85)', color:'white' }}>
                        <FiX className="w-4 h-4"/>
                      </button>
                      <div className="absolute bottom-4 left-4 right-4">
                        <input name="coverImage" value={form.coverImage} onChange={handleChange}
                          placeholder="Or paste image URL..."
                          className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                          style={{ background:'rgba(26,11,46,0.85)', border:'1px solid rgba(255,255,255,0.15)', color:'#F5ECD8' }}/>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background:'rgba(109,40,217,0.2)' }}>
                        <FiUpload className="w-6 h-6" style={{ color:'#A78BFA' }}/>
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color:'rgba(245,236,216,0.7)' }}>
                        {dragging ? 'Drop image here!' : 'Drag & drop cover image'}
                      </p>
                      <p className="text-xs mb-3" style={{ color:'rgba(245,236,216,0.3)' }}>or paste a URL below</p>
                      <input name="coverImage" value={form.coverImage} onChange={handleChange}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full max-w-sm px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#F5ECD8' }}
                        onFocus={e=>e.target.style.borderColor='rgba(109,40,217,0.6)'}
                        onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'}
                      />
                    </div>
                  )}
                </div>

                {/* Title block */}
                <div style={PANEL} className="overflow-hidden">
                  <div style={HEAD}>
                    <span style={LABEL}>Title</span>
                    <span className="ml-auto text-xs" style={{ color: form.title.length>70?'#EF4444':form.title.length>30?'#22C55E':'rgba(245,236,216,0.3)' }}>
                      {form.title.length}/70
                    </span>
                  </div>
                  <div className="p-5">
                    <textarea name="title" value={form.title} onChange={handleChange}
                      placeholder="Write a captivating title..."
                      rows={2}
                      className="w-full text-2xl font-bold bg-transparent outline-none resize-none leading-tight"
                      style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}
                    />
                    {/* Emoji picker trigger */}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={()=>setShowEmoji(v=>!v)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background:'rgba(109,40,217,0.15)', color:'#A78BFA', border:'1px solid rgba(109,40,217,0.25)' }}>
                        <FiSmile className="w-3.5 h-3.5"/> Emoji
                      </button>
                      <AnimatePresence>
                        {showEmoji && (
                          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                            className="flex flex-wrap gap-1 p-2 rounded-xl"
                            style={{ background:'rgba(26,11,46,0.95)', border:'1px solid rgba(109,40,217,0.3)' }}>
                            {EMOJIS.map(e=>(
                              <button key={e} onClick={()=>{ setForm(f=>({...f,title:f.title+e})); setShowEmoji(false); }}
                                className="text-lg hover:scale-125 transition-transform">{e}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div style={PANEL} className="overflow-hidden">
                  <div style={HEAD}>
                    <span style={LABEL}>Excerpt</span>
                    <span className="ml-auto text-xs" style={{ color:'rgba(245,236,216,0.25)' }}>shown in blog cards</span>
                  </div>
                  <div className="p-5">
                    <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2}
                      placeholder="A short summary that hooks the reader..."
                      className="w-full text-sm bg-transparent outline-none resize-none"
                      style={{ color:'rgba(245,236,216,0.75)' }}
                    />
                  </div>
                </div>

                {/* Rich text editor */}
                <div style={PANEL} className="overflow-hidden">
                  <div style={HEAD}>
                    <span style={LABEL}>Content</span>
                    <div className="ml-auto flex items-center gap-3 text-xs" style={{ color:'rgba(245,236,216,0.3)' }}>
                      <span>{wc} words</span>
                      <span>{rt} min read</span>
                    </div>
                  </div>
                  <div className="p-4" style={{ minHeight:380 }}>
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={form.content}
                      onChange={v => setForm(f => ({ ...f, content:v }))}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Start writing your story... Use the toolbar for headings, bold, lists, code blocks and more."
                      style={{ minHeight:320 }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Right: Sidebar ── */}
              <div className="space-y-4">

                {/* ── Publish Settings ── */}
                <div style={PANEL} className="overflow-hidden">
                  <div style={HEAD}><span style={LABEL}>⚙️ Publish Settings</span></div>
                  <div className="p-4 space-y-4">

                    {/* Status toggle */}
                    <div className="flex rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                      {['draft','published'].map(s=>(
                        <button key={s} onClick={()=>setForm(f=>({...f,status:s}))}
                          className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
                          style={form.status===s
                            ?{background:'linear-gradient(135deg,#6D28D9,#8B5CF6)',color:'#F5ECD8'}
                            :{color:'rgba(245,236,216,0.4)'}}>
                          {s==='draft'?'📝 Draft':'🚀 Publish'}
                        </button>
                      ))}
                    </div>

                    {/* Featured toggle */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2 text-sm font-medium" style={{color:'rgba(245,236,216,0.7)'}}>
                        <FiStar className="w-4 h-4" style={{color:'#F59E0B'}}/> Featured Post
                      </span>
                      <div onClick={()=>setFeatured(v=>!v)}
                        className="relative w-10 h-5 rounded-full transition-all cursor-pointer"
                        style={{background:featured?'linear-gradient(135deg,#6D28D9,#8B5CF6)':'rgba(255,255,255,0.12)'}}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                          style={{left:featured?'calc(100% - 1.15rem)':'0.125rem'}}/>
                      </div>
                    </label>

                    {/* Comments toggle */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2 text-sm font-medium" style={{color:'rgba(245,236,216,0.7)'}}>
                        <FiMessageSquare className="w-4 h-4" style={{color:'#60A5FA'}}/> Enable Comments
                      </span>
                      <div onClick={()=>setCommentsOn(v=>!v)}
                        className="relative w-10 h-5 rounded-full transition-all cursor-pointer"
                        style={{background:commentsOn?'linear-gradient(135deg,#6D28D9,#8B5CF6)':'rgba(255,255,255,0.12)'}}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                          style={{left:commentsOn?'calc(100% - 1.15rem)':'0.125rem'}}/>
                      </div>
                    </label>

                    {/* Schedule */}
                    <div>
                      <button onClick={()=>setSchedOpen(v=>!v)}
                        className="flex items-center gap-2 text-sm font-medium w-full transition-colors"
                        style={{color: schedDate?'#A78BFA':'rgba(245,236,216,0.5)'}}>
                        <FiCalendar className="w-4 h-4"/>
                        {schedDate ? `Scheduled: ${new Date(schedDate).toLocaleDateString()}` : 'Schedule Publishing'}
                      </button>
                      <AnimatePresence>
                        {schedOpen && (
                          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}>
                            <input type="datetime-local" value={schedDate}
                              onChange={e=>setSchedDate(e.target.value)}
                              className="mt-2 w-full px-3 py-2 rounded-xl text-sm outline-none"
                              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'#F5ECD8'}}/>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Category */}
                    <div>
                      <label style={{...LABEL,display:'block',marginBottom:'0.5rem'}}>Category</label>
                      <select name="category" value={form.category} onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'#F5ECD8'}}>
                        <option value="">Select category...</option>
                        {categories.map(c=><option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label style={{...LABEL,display:'block',marginBottom:'0.5rem'}}>Tags ({tags.length}/8)</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map(t=>(
                          <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{background:'rgba(109,40,217,0.3)',color:'#C4B5FD',border:'1px solid rgba(109,40,217,0.4)'}}>
                            #{t}
                            <button onClick={()=>removeTag(t)}><FiX className="w-3 h-3"/></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
                          onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addTag();}}}
                          placeholder="tag + Enter"
                          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                          style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'#F5ECD8'}}
                          onFocus={e=>e.target.style.borderColor='rgba(109,40,217,0.6)'}
                          onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.12)'}/>
                        <button onClick={addTag} className="px-3 py-2 rounded-xl text-sm font-semibold"
                          style={{background:'rgba(109,40,217,0.3)',color:'#C4B5FD'}}>+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Stats Dashboard ── */}
                <div style={PANEL} className="overflow-hidden">
                  <div style={HEAD}><span style={LABEL}>📊 Stats</span></div>
                  <div className="p-4 space-y-3">
                    {/* SEO */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{color:'rgba(245,236,216,0.6)'}}>SEO Score</span>
                        <span className="font-bold" style={{color:seoColor(seo)}}>{seo}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
                        <motion.div animate={{width:`${seo}%`}} transition={{duration:0.6}}
                          className="h-full rounded-full" style={{background:`linear-gradient(90deg,${seoColor(seo)},${seoColor(seo)}aa)`}}/>
                      </div>
                      <p className="text-xs mt-1" style={{color:'rgba(245,236,216,0.3)'}}>
                        {seo<50?'Add more content, tags & excerpt':seo<80?'Good! Add headings to improve':'Excellent SEO!'}
                      </p>
                    </div>
                    {/* Engagement */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{color:'rgba(245,236,216,0.6)'}}>Est. Engagement</span>
                        <span className="font-bold" style={{color:'#A78BFA'}}>{eng}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
                        <motion.div animate={{width:`${eng}%`}} transition={{duration:0.6}}
                          className="h-full rounded-full" style={{background:'linear-gradient(90deg,#6D28D9,#A78BFA)'}}/>
                      </div>
                    </div>
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        {l:'Words',    v:wc,  icon:'📝'},
                        {l:'Read time',v:`${rt}m`,icon:'⏱️'},
                        {l:'Tags',     v:tags.length, icon:'🏷️'},
                        {l:'Title len',v:form.title.length,icon:'📏'},
                      ].map(s=>(
                        <div key={s.l} className="text-center p-2 rounded-xl"
                          style={{background:'rgba(255,255,255,0.04)'}}>
                          <p className="text-base">{s.icon}</p>
                          <p className="text-sm font-bold" style={{color:'#F5ECD8'}}>{s.v}</p>
                          <p className="text-xs" style={{color:'rgba(245,236,216,0.35)'}}>{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── AI Writing Studio ── */}
                <div style={{...PANEL,border:'1px solid rgba(109,40,217,0.35)'}} className="overflow-hidden">
                  <div style={{...HEAD,background:'linear-gradient(135deg,rgba(109,40,217,0.5),rgba(42,18,80,0.8))'}}>
                    <BsRobot className="w-4 h-4" style={{color:'#C4B5FD'}}/>
                    <span style={{...LABEL,color:'#C4B5FD'}}>AI Writing Studio</span>
                    <motion.span animate={{opacity:[0.5,1,0.5]}} transition={{duration:2,repeat:Infinity}}
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{background:'rgba(34,197,94,0.2)',color:'#4ADE80'}}>● Live</motion.span>
                  </div>
                  <div className="p-4 space-y-2">
                    <AIBtn icon={<HiOutlineLightBulb className="w-4 h-4"/>} label="Generate Blog Ideas"
                      running={aiLoading==='ideas'} onClick={()=>callAI('ideas')} color="#F59E0B"/>
                    <AIBtn icon={<FiZap className="w-4 h-4"/>} label="AI Title Generator"
                      running={aiLoading==='title'} onClick={()=>callAI('title')} color="#A78BFA"/>
                    <AIBtn icon={<BsTextParagraph className="w-4 h-4"/>} label="Write / Continue Content"
                      running={aiLoading==='write'} onClick={()=>callAI('write')} color="#60A5FA"/>
                    <AIBtn icon={<FiRefreshCw className="w-4 h-4"/>} label="Rewrite & Improve"
                      running={aiLoading==='improve'} onClick={()=>callAI('improve')} color="#34D399"/>
                    <AIBtn icon={<FiCheckCircle className="w-4 h-4"/>} label="Grammar & Spell Check"
                      running={aiLoading==='grammar'} onClick={()=>callAI('grammar')} color="#F87171"/>
                    <AIBtn icon={<FiAlertCircle className="w-4 h-4"/>} label="Generate Summary"
                      running={aiLoading==='summary'} onClick={()=>callAI('summary')} color="#FBBF24"/>
                    <AIBtn icon={<FiTag className="w-4 h-4"/>} label="Suggest Tags"
                      running={aiLoading==='tags'} onClick={()=>callAI('tags')} color="#C084FC"/>
                    <AIBtn icon={<FiTrendingUp className="w-4 h-4"/>} label="SEO Tips"
                      running={aiLoading==='seo'} onClick={()=>callAI('seo')} color="#4ADE80"/>

                    <ResultBox
                      text={aiResult.text}
                      onApply={['title','summary','tags','improve','write','grammar'].includes(aiResult.type) ? applyResult : null}
                      onClose={()=>setAiResult({text:'',type:''})}
                    />
                  </div>
                </div>

                {/* ── Final publish card ── */}
                <div style={PANEL} className="overflow-hidden">
                  <div className="p-4 space-y-3">
                    <button onClick={()=>handleSubmit('draft')} disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(245,236,216,0.8)'}}>
                      <FiSave className="w-4 h-4"/> Save as Draft
                    </button>
                    <button onClick={()=>handleSubmit('published')} disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                      style={{background:'linear-gradient(135deg,#6D28D9,#8B5CF6)',color:'#F5ECD8',boxShadow:'0 6px 24px rgba(109,40,217,0.45)'}}>
                      {loading ? <FiLoader className="w-4 h-4 animate-spin"/> : <FiSend className="w-4 h-4"/>}
                      {schedDate ? 'Schedule Post' : 'Publish Now'}
                    </button>
                  </div>
                </div>

              </div>{/* end sidebar */}
            </motion.div>
          )}

          {/* ════════════════════ PREVIEW TAB ════════════════════ */}
          {activeTab === 'preview' && (
            <motion.div key="preview"
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
              transition={{duration:0.3}}>

              {/* Mode switcher */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-sm font-medium" style={{color:'#7C5FA8'}}>Preview as:</span>
                {[{v:'desktop',icon:<FiMonitor className="w-4 h-4"/>,label:'Desktop'},
                  {v:'mobile', icon:<FiSmartphone className="w-4 h-4"/>,label:'Mobile'}].map(m=>(
                  <button key={m.v} onClick={()=>setPreviewMode(m.v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={previewMode===m.v
                      ?{background:'linear-gradient(135deg,#6D28D9,#8B5CF6)',color:'#F5ECD8',boxShadow:'0 4px 14px rgba(109,40,217,0.4)'}
                      :{background:'#1E0D3A',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(245,236,216,0.6)'}}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <div className="overflow-auto rounded-3xl shadow-2xl bg-white"
                  style={{
                    width: previewMode==='mobile' ? 390 : '100%',
                    maxWidth: previewMode==='mobile' ? 390 : '900px',
                    border:'1px solid rgba(109,40,217,0.12)',
                    transition:'all 0.4s ease',
                  }}>
                  {/* Cover */}
                  {form.coverImage && (
                    <div className="w-full overflow-hidden" style={{height:previewMode==='mobile'?200:320}}>
                      <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover"
                        onError={e=>e.target.style.display='none'}/>
                    </div>
                  )}
                  {/* Content */}
                  <div className={`p-8 ${previewMode==='mobile'?'p-5':''}`}>
                    {form.category && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                        style={{background:'rgba(109,40,217,0.12)',color:'#6D28D9'}}>
                        {categories.find(c=>c._id===form.category)?.icon} {categories.find(c=>c._id===form.category)?.name || 'Category'}
                      </span>
                    )}
                    <h1 className="font-extrabold leading-tight mb-4"
                      style={{fontFamily:'"Playfair Display",serif',fontSize:previewMode==='mobile'?'1.6rem':'2.25rem',color:'#1A0B2E'}}>
                      {form.title || 'Your title will appear here...'}
                    </h1>
                    <div className="flex items-center gap-4 mb-6 pb-6 text-sm"
                      style={{color:'#9CA3AF',borderBottom:'1px solid rgba(109,40,217,0.10)'}}>
                      <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5"/> {rt} min read</span>
                      <span className="flex items-center gap-1"><BsTextParagraph className="w-3.5 h-3.5"/> {wc} words</span>
                    </div>
                    {form.excerpt && (
                      <p className="text-base italic mb-6 pb-6 leading-relaxed"
                        style={{color:'#6B7280',borderBottom:'1px solid rgba(109,40,217,0.07)'}}>
                        {form.excerpt}
                      </p>
                    )}
                    {form.content ? (
                      <div className="prose-content"
                        dangerouslySetInnerHTML={{__html:form.content}}/>
                    ) : (
                      <p style={{color:'#D1D5DB',fontStyle:'italic'}}>Your content will appear here...</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-8 pt-6"
                        style={{borderTop:'1px solid rgba(109,40,217,0.08)'}}>
                        {tags.map(t=>(
                          <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{background:'rgba(109,40,217,0.10)',color:'#6D28D9'}}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
