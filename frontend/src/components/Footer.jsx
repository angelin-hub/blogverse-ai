import { Link } from 'react-router-dom';
import { FiTwitter, FiGithub, FiLinkedin, FiSend } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const LINKS = {
  Product: [{ l:'Home',to:'/' },{ l:'Blogs',to:'/blogs' },{ l:'Categories',to:'/categories' },{ l:'Write',to:'/create' }],
  Company: [{ l:'About',to:'#' },{ l:'Careers',to:'#' },{ l:'Press',to:'#' }],
  Legal:   [{ l:'Privacy',to:'#' },{ l:'Terms',to:'#' },{ l:'Cookies',to:'#' }],
};
const SOCIALS = [
  { icon:<FiTwitter/>,  href:'#', label:'Twitter' },
  { icon:<FiGithub/>,   href:'#', label:'GitHub' },
  { icon:<FiLinkedin/>, href:'#', label:'LinkedIn' },
  { icon:<FaDiscord/>,  href:'#', label:'Discord' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const sub = e => { e.preventDefault(); if(!email.trim()) return; toast.success('Subscribed! ✨'); setEmail(''); };

  return (
    <footer style={{ background:'#1A0B2E', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow:'0 0 20px rgba(109,40,217,0.4)' }}>
                <HiSparkles className="w-5 h-5" style={{ color:'#F5ECD8' }} />
              </span>
              <span className="font-extrabold text-2xl"
                style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>
                BlogVerse <span style={{ color:'#A78BFA' }}>AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color:'rgba(245,236,216,0.38)' }}>
              The AI-powered blogging platform where human creativity meets artificial intelligence.
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color:'#F5ECD8' }}>Stay in the loop</p>
            <form onSubmit={sub} className="flex gap-2 mb-6">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'#F5ECD8' }}
                onFocus={e=>e.target.style.borderColor='rgba(109,40,217,0.6)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}
              />
              <button type="submit" className="px-3 py-2 rounded-xl"
                style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#F5ECD8' }}>
                <FiSend className="w-4 h-4" />
              </button>
            </form>
            <div className="flex gap-3">
              {SOCIALS.map(s=>(
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(245,236,216,0.4)' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(109,40,217,0.3)'; e.currentTarget.style.color='#A78BFA'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(245,236,216,0.4)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([group,links])=>(
            <div key={group}>
              <h4 className="text-sm font-semibold mb-4"
                style={{ fontFamily:'"Playfair Display",serif', color:'#F5ECD8' }}>{group}</h4>
              <ul className="space-y-2.5">
                {links.map(link=>(
                  <li key={link.l}>
                    <Link to={link.to} className="text-sm transition-colors"
                      style={{ color:'rgba(245,236,216,0.38)' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#A78BFA'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.38)'}
                    >{link.l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color:'rgba(245,236,216,0.25)' }}>
            © {new Date().getFullYear()} BlogVerse AI. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color:'rgba(245,236,216,0.25)' }}>
            Built with <span style={{ color:'#BE185D' }}>♥</span> using React, Node.js &amp; OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
