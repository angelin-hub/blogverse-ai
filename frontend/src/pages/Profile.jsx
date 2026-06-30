import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiUsers, FiBookOpen, FiHeart,
  FiUserPlus, FiUserCheck, FiEdit, FiX, FiSave,
  FiMapPin, FiGlobe, FiCamera, FiLoader, FiCheck,
  FiLink,
} from 'react-icons/fi';
import { FiGithub, FiTwitter } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/* ── Avatar upload via URL or file ── */
function AvatarUploader({ current, name, onSave, onCancel }) {
  const [url,      setUrl]      = useState(current || '');
  const [preview,  setPreview]  = useState(current || '');
  const [saving,   setSaving]   = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUrl(objectUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(url);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
      className="rounded-2xl p-5 space-y-4"
      style={{ background:'#1E0D3A', border:'1px solid rgba(109,40,217,0.35)', boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
      <p className="text-sm font-bold" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>
        Change Profile Photo
      </p>
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6D28D9&color=fff&size=80`}
            alt="Preview"
            className="w-20 h-20 rounded-2xl object-cover"
            style={{ border:'2px solid rgba(167,139,250,0.4)' }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6D28D9&color=fff&size=80`; }}
          />
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)' }}>
            <FiCamera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium mb-1" style={{ color:'rgba(245,236,216,0.55)' }}>Paste image URL</p>
          <input value={url} onChange={e => { setUrl(e.target.value); setPreview(e.target.value); }}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'#F5ECD8' }}
            onFocus={e => e.target.style.borderColor = 'rgba(109,40,217,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(245,236,216,0.7)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        <FiCamera className="w-4 h-4" /> Upload from Device
      </button>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(245,236,216,0.6)' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
          style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#F5ECD8', boxShadow:'0 4px 16px rgba(109,40,217,0.4)' }}>
          {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
          Save Photo
        </button>
      </div>
    </motion.div>
  );
}

/* ── Edit Profile Modal ── */
function EditModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     profile.name     || '',
    bio:      profile.bio      || '',
    location: profile.location || '',
    website:  profile.website  || '',
    linkedin: profile.linkedin || '',
    github:   profile.github   || '',
    twitter:  profile.twitter  || '',
  });
  const [saving, setSaving] = useState(false);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally { setSaving(false); }
  };

  const fields = [
    { name:'name',     label:'Full Name',       icon:'👤', ph:'Your name' },
    { name:'bio',      label:'Bio',             icon:'📝', ph:'Tell the world about yourself...', rows:3 },
    { name:'location', label:'Location',        icon:'📍', ph:'City, Country' },
    { name:'website',  label:'Website',         icon:'🌐', ph:'https://yourwebsite.com' },
    { name:'linkedin', label:'LinkedIn',        icon:'💼', ph:'https://linkedin.com/in/username' },
    { name:'github',   label:'GitHub',          icon:'💻', ph:'https://github.com/username' },
    { name:'twitter',  label:'Twitter / X',     icon:'🐦', ph:'https://twitter.com/username' },
  ];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale:0.9, y:24 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:24 }}
        transition={{ type:'spring', stiffness:280, damping:26 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background:'#1A0B2E', border:'1px solid rgba(109,40,217,0.3)', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background:'linear-gradient(135deg,rgba(109,40,217,0.4),rgba(26,11,46,0.95))', borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(12px)' }}>
          <div className="flex items-center gap-2">
            <HiSparkles className="w-5 h-5" style={{ color:'#A78BFA' }} />
            <h2 className="font-bold text-base" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
              Edit Profile
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background:'rgba(255,255,255,0.07)', color:'rgba(245,236,216,0.6)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
                style={{ color:'rgba(245,236,216,0.5)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                <span>{f.icon}</span> {f.label}
              </label>
              {f.rows ? (
                <textarea name={f.name} value={form[f.name]} onChange={ch} rows={f.rows}
                  placeholder={f.ph}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                  style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'#F5ECD8' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,40,217,0.65)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
                />
              ) : (
                <input name={f.name} type="text" value={form[f.name]} onChange={ch}
                  placeholder={f.ph}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'#F5ECD8' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,40,217,0.65)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(245,236,216,0.7)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#F5ECD8', boxShadow:'0 6px 24px rgba(109,40,217,0.45)' }}>
              {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Social link chip ── */
function SocialLink({ href, icon, label, color }) {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group"
      style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(245,236,216,0.7)', textDecoration:'none' }}
      onMouseEnter={e => { e.currentTarget.style.background = color + '22'; e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.color = '#F5ECD8'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#1E0D3A'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(245,236,216,0.7)'; }}
    >
      <span style={{ color }}>{icon}</span>
      {label}
    </a>
  );
}

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
export default function Profile() {
  const { id } = useParams();
  const { user: me, isAuthenticated, updateUser } = useAuth();

  const [profile,       setProfile]       = useState(null);
  const [blogs,         setBlogs]         = useState([]);
  const [likedBlogs,    setLikedBlogs]    = useState([]);
  const [tab,           setTab]           = useState('posts');
  const [loading,       setLoading]       = useState(true);
  const [following,     setFollowing]     = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editOpen,      setEditOpen]      = useState(false);
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const [copied,        setCopied]        = useState(false);

  const isOwn = me?._id === id || me?.id === id;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get('/blogs', { params: { author: id, status: 'published' } }),
    ]).then(([pr, br]) => {
      setProfile(pr.data.user);
      setBlogs(br.data.blogs || []);
      setFollowing(pr.data.user.followers?.includes(me?._id) || false);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadLiked = async () => {
    if (likedBlogs.length > 0) return;
    try { const r = await api.get(`/users/${id}/liked`); setLikedBlogs(r.data.blogs || []); } catch {}
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Login to follow'); return; }
    setFollowLoading(true);
    try {
      await api.post(`/users/${id}/${following ? 'unfollow' : 'follow'}`);
      setFollowing(v => !v);
      setProfile(p => ({
        ...p,
        followers: following
          ? (p.followers || []).filter(f => f !== me._id)
          : [...(p.followers || []), me._id],
      }));
      toast.success(following ? 'Unfollowed' : 'Following!');
    } catch { toast.error('Action failed'); }
    finally { setFollowLoading(false); }
  };

  const handleSaveProfile = async (data) => {
    try {
      const { data: res } = await api.put('/users/profile', data);
      setProfile(p => ({ ...p, ...res.user }));
      updateUser(res.user);
      toast.success('Profile updated! ✨');
      setEditOpen(false);
    } catch { toast.error('Failed to update'); }
  };

  const handleSaveAvatar = async (avatarUrl) => {
    try {
      const { data: res } = await api.put('/users/profile', { avatar: avatarUrl });
      setProfile(p => ({ ...p, avatar: res.user.avatar }));
      updateUser(res.user);
      toast.success('Photo updated!');
      setAvatarOpen(false);
    } catch { toast.error('Failed to update photo'); }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Profile link copied!');
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>
      <div className="h-56 skeleton" style={{ borderRadius: 0 }} />
      <div className="max-w-5xl mx-auto px-4 -mt-16 space-y-4 pt-4">
        <div className="skeleton w-28 h-28 rounded-2xl" />
        <div className="skeleton h-6 w-48 rounded" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#FDF6EC' }}>
      <div className="text-center">
        <p className="text-5xl mb-4">👤</p>
        <h2 className="text-xl font-bold" style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
          User Not Found
        </h2>
      </div>
    </div>
  );

  const STATS = [
    { l:'Posts',     v: blogs.length,                                      icon:'📝' },
    { l:'Followers', v: profile.followers?.length || 0,                   icon:'👥' },
    { l:'Following', v: profile.following?.length || 0,                   icon:'➕' },
    { l:'Likes',     v: blogs.reduce((a, b) => a + (b.likesCount || 0), 0), icon:'❤️' },
  ];

  return (
    <div className="min-h-screen" style={{ background:'#FDF6EC' }}>

      {/* ── Cover ── */}
      <div className="relative h-52 sm:h-64 overflow-hidden"
        style={{ background:'linear-gradient(135deg,#1A0B2E 0%,#2A1250 45%,#6D28D9 100%)' }}>
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage:'radial-gradient(circle,rgba(245,236,216,0.8) 1.5px,transparent 1.5px)', backgroundSize:'28px 28px' }} />
        {/* glow orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background:'rgba(109,40,217,0.35)', filter:'blur(70px)', transform:'translate(20%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background:'rgba(167,139,250,0.2)', filter:'blur(60px)', transform:'translate(-20%,30%)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* ── Profile header ── */}
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            {/* Avatar + name */}
            <div className="flex items-end gap-5">
              <div className="relative flex-shrink-0">
                <img
                  src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6D28D9&color=fff&size=128`}
                  alt={profile.name}
                  className="w-32 h-32 rounded-2xl object-cover"
                  style={{ border:'4px solid #FDF6EC', boxShadow:'0 8px 32px rgba(30,13,58,0.25)' }}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6D28D9&color=fff&size=128`; }}
                />
                {isOwn && (
                  <button onClick={() => setAvatarOpen(true)}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all"
                    style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', border:'2px solid #FDF6EC' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <FiCamera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              <div className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold"
                    style={{ fontFamily:'"Playfair Display",serif', color:'#1A0B2E' }}>
                    {profile.name}
                  </h1>
                  {profile.role === 'admin' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background:'rgba(109,40,217,0.12)', color:'#6D28D9', border:'1px solid rgba(109,40,217,0.2)' }}>
                      <HiSparkles className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-sm" style={{ color:'#7C5FA8' }}>
                    <FiCalendar className="w-3.5 h-3.5" />
                    Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'N/A'}
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1 text-sm" style={{ color:'#7C5FA8' }}>
                      <FiMapPin className="w-3.5 h-3.5" /> {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-2 flex-wrap">
              <button onClick={copyProfileLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background:'rgba(109,40,217,0.08)', border:'1.5px solid rgba(109,40,217,0.18)', color:'#6D28D9' }}>
                {copied ? <FiCheck className="w-4 h-4" /> : <FiLink className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share'}
              </button>
              {isOwn ? (
                <button onClick={() => setEditOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-secondary">
                  <FiEdit className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <button onClick={handleFollow} disabled={followLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={following
                    ? { background:'rgba(109,40,217,0.10)', color:'#6D28D9', border:'1.5px solid rgba(109,40,217,0.25)' }
                    : { background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#F5ECD8', boxShadow:'0 4px 16px rgba(109,40,217,0.35)' }
                  }>
                  {followLoading
                    ? <FiLoader className="w-4 h-4 animate-spin" />
                    : following ? <FiUserCheck className="w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />
                  }
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Avatar uploader ── */}
        <AnimatePresence>
          {avatarOpen && (
            <div className="mb-6">
              <AvatarUploader
                current={profile.avatar}
                name={profile.name}
                onSave={handleSaveAvatar}
                onCancel={() => setAvatarOpen(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* ── Bio + social links ── */}
        <div className="mb-10 space-y-4">
          {profile.bio && (
            <p className="text-base leading-relaxed max-w-2xl" style={{ color:'#4B3068' }}>
              {profile.bio}
            </p>
          )}

          {/* Social links row */}
          {(profile.linkedin || profile.github || profile.twitter || profile.website) && (
            <div className="flex flex-wrap gap-2">
              <SocialLink
                href={profile.linkedin}
                icon={<FaLinkedinIn className="w-4 h-4" />}
                label="LinkedIn"
                color="#0077B5"
              />
              <SocialLink
                href={profile.github}
                icon={<FiGithub className="w-4 h-4" />}
                label="GitHub"
                color="#E5E7EB"
              />
              <SocialLink
                href={profile.twitter}
                icon={<FiTwitter className="w-4 h-4" />}
                label="Twitter"
                color="#1DA1F2"
              />
              <SocialLink
                href={profile.website}
                icon={<FiGlobe className="w-4 h-4" />}
                label="Website"
                color="#A78BFA"
              />
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {STATS.map((s, i) => (
            <motion.div key={s.l}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              whileHover={{ y:-4, transition:{ type:'spring', stiffness:300 } }}
              className="rounded-2xl p-5 text-center"
              style={{ background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 4px 16px rgba(30,13,58,0.12)' }}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-extrabold"
                style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{s.v}</p>
              <p className="text-xs mt-0.5" style={{ color:'rgba(245,236,216,0.4)' }}>{s.l}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit"
          style={{ background:'rgba(109,40,217,0.08)', border:'1px solid rgba(109,40,217,0.12)' }}>
          {[{ id:'posts', l:'📝 Posts' }, { id:'liked', l:'❤️ Liked' }].map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id); if (t.id === 'liked') loadLiked(); }}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t.id
                ? { background:'#1E0D3A', color:'#F5ECD8', boxShadow:'0 2px 8px rgba(30,13,58,0.2)' }
                : { color:'#7C5FA8' }
              }>{t.l}</button>
          ))}
        </div>

        {/* ── Blog grid ── */}
        <motion.div key={tab}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tab === 'posts' ? blogs : likedBlogs).map((b, i) => (
            <BlogCard key={b._id} blog={b} index={i} />
          ))}
          {(tab === 'posts' ? blogs : likedBlogs).length === 0 && (
            <div className="col-span-3 text-center py-16">
              <p className="text-4xl mb-3">{tab === 'posts' ? '📭' : '💔'}</p>
              <p style={{ color:'#7C5FA8' }}>{tab === 'posts' ? 'No posts yet' : 'No liked posts yet'}</p>
              {isOwn && tab === 'posts' && (
                <Link to="/create" className="btn-primary text-sm mt-4 inline-block">Write your first post</Link>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editOpen && (
          <EditModal
            profile={profile}
            onSave={handleSaveProfile}
            onClose={() => setEditOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
