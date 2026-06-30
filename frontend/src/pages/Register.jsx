import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function Strength({ pw }) {
  const checks = [
    { l:'8+ chars',  ok: pw.length >= 8 },
    { l:'Uppercase', ok: /[A-Z]/.test(pw) },
    { l:'Number',    ok: /\d/.test(pw) },
    { l:'Symbol',    ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const n = checks.filter(c => c.ok).length;
  const clr = ['#EF4444','#F97316','#EAB308','#22C55E'][n-1] || 'rgba(255,255,255,0.12)';
  if (!pw) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < n ? clr : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.l} className="text-xs flex items-center gap-1"
            style={{ color: c.ok ? '#86EFAC' : 'rgba(245,236,216,0.3)' }}>
            <FiCheck className="w-3 h-3" style={{ opacity: c.ok?1:0.3 }} /> {c.l}
          </span>
        ))}
        {n > 0 && <span className="text-xs font-semibold ml-auto" style={{ color:clr }}>
          {['Weak','Fair','Good','Strong'][n-1]}
        </span>}
      </div>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,     setForm]    = useState({ name:'', email:'', password:'', confirm:'' });
  const [showPass, setShowPass]= useState(false);
  const [agreed,   setAgreed]  = useState(false);
  const [loading,  setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) { toast.error('Fill all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password too short'); return; }
    if (!agreed) { toast.error('Accept the terms'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome ✨');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name:'name',     type:'text',  icon:<FiUser/>,  placeholder:'John Doe',         label:'Full Name',  auto:'name'  },
    { name:'email',    type:'email', icon:<FiMail/>,  placeholder:'you@example.com',   label:'Email',      auto:'email' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background:'linear-gradient(145deg, #FDF6EC 0%, #F5ECD8 50%, #EEE0C8 100%)' }}
    >
      {/* bg blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'rgba(109,40,217,0.06)', filter:'blur(80px)', transform:'translate(-30%,-30%)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background:'rgba(109,40,217,0.05)', filter:'blur(70px)', transform:'translate(30%,30%)' }} />

      <motion.div
        initial={{ opacity:0, y:28, scale:0.97 }}
        animate={{ opacity:1, y:0,  scale:1 }}
        transition={{ duration:0.5, type:'spring', stiffness:200, damping:24 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Dark violet card with LEFT accent bar */}
        <div className="flex rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 24px 80px rgba(30,13,58,0.25), 0 0 0 1px rgba(109,40,217,0.12)' }}
        >
          {/* LEFT BAR */}
          <div className="w-1.5 flex-shrink-0"
            style={{ background:'linear-gradient(180deg,#A78BFA 0%,#6D28D9 50%,#A78BFA 100%)' }}
          />

          {/* Card body */}
          <div className="flex-1 p-8" style={{ background:'#1E0D3A' }}>

            {/* Logo */}
            <div className="text-center mb-7">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <motion.div whileHover={{ rotate:16 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow:'0 6px 24px rgba(109,40,217,0.5)' }}>
                  <HiSparkles className="w-6 h-6" style={{ color:'#F5ECD8' }} />
                </motion.div>
                <span className="font-extrabold text-2xl" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                  BlogVerse <span style={{ color:'#A78BFA' }}>AI</span>
                </span>
              </Link>
              <h1 className="text-2xl font-bold" style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                Create your account
              </h1>
              <p className="text-sm mt-1" style={{ color:'rgba(245,236,216,0.4)' }}>
                Join thousands of writers today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color:'rgba(245,236,216,0.75)' }}>{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'rgba(245,236,216,0.3)' }}>{f.icon}</span>
                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                      placeholder={f.placeholder} autoComplete={f.auto} className="input-dark pl-10" />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:'rgba(245,236,216,0.75)' }}>Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'rgba(245,236,216,0.3)' }} />
                  <input name="password" type={showPass?'text':'password'} value={form.password} onChange={handleChange}
                    placeholder="••••••••" autoComplete="new-password" className="input-dark pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(v=>!v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color:'rgba(245,236,216,0.3)' }}>
                    {showPass ? <FiEyeOff className="w-4 h-4"/> : <FiEye className="w-4 h-4"/>}
                  </button>
                </div>
                <Strength pw={form.password} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:'rgba(245,236,216,0.75)' }}>Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'rgba(245,236,216,0.3)' }} />
                  <input name="confirm" type={showPass?'text':'password'} value={form.confirm} onChange={handleChange}
                    placeholder="••••••••" autoComplete="new-password" className="input-dark pl-10"
                    style={{ borderColor: form.confirm ? (form.confirm===form.password?'rgba(34,197,94,0.5)':'rgba(239,68,68,0.5)') : undefined }}
                  />
                </div>
                {form.confirm && form.confirm!==form.password && (
                  <p className="text-xs mt-1 text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setAgreed(v=>!v)}
                  className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background:agreed?'linear-gradient(135deg,#6D28D9,#8B5CF6)':'transparent', border:agreed?'none':'1.5px solid rgba(255,255,255,0.15)' }}>
                  {agreed && <FiCheck className="w-3 h-3" style={{ color:'#F5ECD8' }} />}
                </div>
                <span className="text-sm leading-relaxed" style={{ color:'rgba(245,236,216,0.45)' }}>
                  I agree to the <a href="#" style={{ color:'#A78BFA' }}>Terms</a> and <a href="#" style={{ color:'#A78BFA' }}>Privacy Policy</a>
                </span>
              </label>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-2"
                style={{
                  background: loading ? 'rgba(109,40,217,0.4)' : 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
                  color:'#F5ECD8',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(109,40,217,0.5)',
                  border:'1px solid rgba(167,139,250,0.2)',
                }}
              >
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"/> Creating...</>
                  : <>Create Account <FiArrowRight/></>
                }
              </motion.button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color:'rgba(245,236,216,0.35)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color:'#A78BFA' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
