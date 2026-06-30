import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { BsRobot } from 'react-icons/bs';
import api from '../utils/api';

const QUICK = [
  { label:'💡 Blog Ideas',   prompt:'Give me 5 creative blog post ideas for 2024' },
  { label:'✍️ Writing Help', prompt:'Help me write a compelling blog introduction' },
  { label:'📝 Titles',       prompt:'Suggest 5 catchy blog titles about technology' },
  { label:'🪄 Improve',      prompt:'How can you help me improve my writing?' },
];

const WELCOME = {
  id:'w', role:'ai',
  text:"Hi! I'm your AI writing assistant ✨\n\nI can help you:\n• Generate blog ideas\n• Suggest catchy titles\n• Improve your writing\n• Summarize content\n\nWhat can I help you with today?",
};

function Typing() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)' }}>
        <BsRobot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.09)' }}>
        <div className="flex items-center gap-1">
          <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
        </div>
      </div>
    </div>
  );
}

function Msg({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}
      className={`flex items-end gap-2 mb-3 ${isUser?'flex-row-reverse':''}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isUser?'rgba(255,255,255,0.12)':'linear-gradient(135deg,#6D28D9,#8B5CF6)' }}>
        {isUser
          ? <span className="text-xs font-bold" style={{ color:'#F5ECD8' }}>U</span>
          : <BsRobot className="w-3.5 h-3.5 text-white" />
        }
      </div>
      <div className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl ${isUser?'rounded-br-sm':'rounded-bl-sm'}`}
        style={isUser
          ? { background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#F5ECD8' }
          : { background:'rgba(255,255,255,0.07)', color:'#F5ECD8', border:'1px solid rgba(255,255,255,0.09)' }
        }
      >{msg.text}</div>
    </motion.div>
  );
}

export default function AIChatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { if(open) setTimeout(()=>inputRef.current?.focus(),300); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages,loading]);

  const send = async text => {
    const t = (text||input).trim();
    if(!t||loading) return;
    setMessages(p=>[...p,{id:Date.now(),role:'user',text:t}]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat',{message:t});
      setMessages(p=>[...p,{id:Date.now()+1,role:'ai',text:data.reply||data.message||'...'}]);
    } catch {
      setMessages(p=>[...p,{id:Date.now()+1,role:'ai',text:'⚠️ AI unavailable. Add OPENAI_API_KEY to backend/.env and restart.'}]);
    } finally { setLoading(false); }
  };

  const onKey = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  return (
    <>
      {/* FAB */}
      <motion.button onClick={()=>setOpen(v=>!v)}
        whileHover={{scale:1.12}} whileTap={{scale:0.93}}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow:'0 8px 28px rgba(109,40,217,0.50)' }}
        aria-label="AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.2}}><FiX className="w-6 h-6 text-white"/></motion.span>
            : <motion.span key="s" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.2}}><HiSparkles className="w-6 h-6 text-white"/></motion.span>
          }
        </AnimatePresence>
        {!open && <span className="absolute inset-0 rounded-2xl animate-ping" style={{background:'rgba(109,40,217,0.3)'}}/>}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity:0,scale:0.88,y:24}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.88,y:24}}
            transition={{type:'spring',stiffness:320,damping:28}}
            className="fixed bottom-24 right-6 z-50 flex flex-col w-80 sm:w-96 rounded-2xl overflow-hidden"
            style={{ maxHeight:520, background:'#1E0D3A', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 24px 80px rgba(0,0,0,0.45)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background:'linear-gradient(135deg,rgba(109,40,217,0.45),rgba(42,18,80,0.6))', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)' }}>
                  <HiSparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color:'#F5ECD8', fontFamily:'"Playfair Display",serif' }}>BlogVerse AI</p>
                  <p className="text-xs flex items-center gap-1" style={{ color:'#4ADE80' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/> Online
                  </p>
                </div>
              </div>
              <button onClick={()=>setOpen(false)} className="p-1.5 rounded-lg transition-colors"
                style={{ color:'rgba(245,236,216,0.4)' }}
                onMouseEnter={e=>e.currentTarget.style.color='#F5ECD8'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(245,236,216,0.4)'}
              ><FiX className="w-4 h-4"/></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{minHeight:0}}>
              {messages.map(m=><Msg key={m.id} msg={m}/>)}
              {loading && <Typing/>}
              <div ref={bottomRef}/>
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map(q=>(
                  <button key={q.label} onClick={()=>send(q.prompt)} disabled={loading}
                    className="text-xs px-2.5 py-1 rounded-full transition-all disabled:opacity-50"
                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(245,236,216,0.65)' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(109,40,217,0.3)'; e.currentTarget.style.color='#F5ECD8'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(245,236,216,0.65)'; }}
                  >{q.label}</button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-end gap-2 px-4 py-3 flex-shrink-0"
              style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
                placeholder="Ask me anything..." rows={1}
                className="flex-1 resize-none text-sm outline-none transition-all"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:12, padding:'0.5rem 0.75rem', color:'#F5ECD8', minHeight:40, maxHeight:96 }}
                onFocus={e=>e.target.style.borderColor='rgba(109,40,217,0.6)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}
              />
              <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.93}}
                onClick={()=>send()} disabled={!input.trim()||loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow:'0 4px 14px rgba(109,40,217,0.4)' }}
              ><FiSend className="w-4 h-4 text-white"/></motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
