import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Calendar, ClipboardList, BookOpen, MapPin, Sparkles, X, Bot, User, CheckCircle, ArrowRight } from 'lucide-react';

/* ===== DETECT & RESPOND (simplified) ===== */
function detectIntent(text) {
  const l = text.toLowerCase().trim();
  if (/exam\s*date|when.*exam|calendar/.test(l)) return 'exam_dates';
  if (/book|register|reserve|enroll/.test(l)) return 'book_exam';
  if (/mock|practice|sample/.test(l)) return 'mock_exams';
  if (/contact|location|address/.test(l)) return 'contact';
  if (/cma|celpip|ielts|toefl|gre|acca|mrcs|aws/.test(l)) return 'exam_info';
  return 'unknown';
}

function respond(intent) {
  const actions = (list) => list.map((a) => ({ label: a[0], intent: a[1], icon: a[2] }));
  switch (intent) {
    case 'exam_dates': return { content: `I'll open the live calendar! You can explore all available slots for CMA, CELPIP, and multiple other certification exams instantly.`, openPanel: 'exam-dates',
      actions: actions([['Book Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]) };
    case 'book_exam': return { content: `Let's secure your seat. I'm opening our premium booking portal so you can select your preferred location and date right now.`, openPanel: 'booking',
      actions: actions([['Check Dates First', 'exam_dates', Calendar]]) };
    case 'mock_exams': return { content: `We provide full-simulation mock tests under real exam conditions at our certified centres. I'll show you the full list.`, openPanel: 'mock-exams',
      actions: actions([['Book Exam', 'book_exam', ClipboardList]]) };
    case 'contact': return { content: `Experience excellence at our state-of-the-art centres in **Calicut** and **Kochi**. \n\n📞 +91 9605686000\n📍 FETS, K7 Corporate Towers, Calicut\n\nWould you like me to open the centre location map for you?`, openPanel: 'contact',
      actions: actions([['Book Exam', 'book_exam', ClipboardList]]) };
    case 'exam_info': return { content: `As Kerala's premier testing partner, FETS provides secure, authorized environments for Prometric, Pearson VUE, IELTS and more.\n\nEverything from medical certifications to business exams. Want to see availability?`,
      actions: actions([['Check Dates', 'exam_dates', Calendar], ['Book', 'book_exam', ClipboardList]]) };
    default: return { content: `I'm FETS AI Assistant. I can help you find exam dates, manage bookings, or set up mock tests. Try one of these:`,
      actions: actions([['Check Exam Dates', 'exam_dates', Calendar], ['Book an Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]) };
  }
}

const WELCOME = {
  id: 'w1', type: 'agent',
  content: `Welcome to **FETS.in**. 👋 \n\nI'm your dedicated Assistant. Looking to check live availability, book a CMA mock, or enroll for an international certification? I can help you with anything.`,
  showActions: true,
};

export default function AgentChatOverlay({ onClose, onOpenPanel }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const addUserMsg = (text) => setMessages((prev) => [...prev, { id: `u-${Date.now()}`, type: 'user', content: text }]);

  const processIntent = useCallback((intent) => {
    setIsTyping(true);
    const res = respond(intent);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, type: 'agent', content: res.content, actions: res.actions, showActions: !!res.actions }]);
      setIsTyping(false);
      if (res.openPanel) onOpenPanel(res.openPanel);
    }, 800);
  }, [onOpenPanel]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput('');
    addUserMsg(text);
    processIntent(detectIntent(text));
  };
  
  const handleChip = (intent, label) => {
    addUserMsg(label);
    processIntent(intent);
  };

  return (
    <div className="flex flex-col h-full bg-[#080808]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0a0a0a] shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFD000] to-[#E6AC00] flex items-center justify-center text-dark-950 shadow-[0_0_15px_rgba(255,208,0,0.3)]">
            <Bot size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">EXAM ASSIST</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Intelligence</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               {msg.type === 'agent' ? (
                 <div className="w-5 h-5 rounded-md bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000]"><Bot size={12} /></div>
               ) : (
                 <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-white/40"><User size={12} /></div>
               )}
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                 {msg.type === 'agent' ? 'Assistant' : 'Candidate'}
               </span>
            </div>
            <div className={`max-w-[90%] rounded-2xl p-5 text-sm leading-relaxed shadow-lg ${
              msg.type === 'user' 
                ? 'bg-[#FFD000] text-dark-950 font-bold border border-[#FFD000]/20 rounded-tr-sm transition-all hover:shadow-[0_8px_20px_rgba(255,208,0,0.2)]' 
                : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-sm shadow-inner'
            }`}>
              {msg.content.split('\n').map((l, i) => l === '' ? <div key={i} className="h-1"/> : (
                <p key={i}>
                  {l.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith('**') ? <strong key={j} className="font-black text-white">{p.slice(2,-2)}</strong> : <span key={j}>{p}</span>)}
                </p>
              ))}
              
              {msg.type === 'agent' && msg.showActions && (
                <div className="space-y-2 mt-6 pt-6 border-t border-white/5">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3">Recommended Next Steps</p>
                  <div className="flex flex-col gap-2">
                    {msg.actions ? msg.actions.map((a, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleChip(a.intent, a.label)} 
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-white/70 hover:bg-[#FFD000]/10 hover:border-[#FFD000]/30 hover:text-[#FFD000] transition-all group/chip cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <a.icon size={14}/>
                          <span className="text-xs font-bold tracking-tight">{a.label}</span>
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover/chip:opacity-100 group-hover/chip:translate-x-1 transition-all" />
                      </button>
                    )) : [
                      { l: 'Check Exam Dates', i: 'exam_dates', I: Calendar },
                      { l: 'Enroll for Booking', i: 'book_exam', I: ClipboardList },
                      { l: 'Browse Mock Exams', i: 'mock_exams', I: BookOpen },
                    ].map((a, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleChip(a.i, a.l)} 
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-white/70 hover:bg-[#FFD000]/10 hover:border-[#FFD000]/30 hover:text-[#FFD000] transition-all group/chip cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <a.I size={14}/>
                          <span className="text-xs font-bold tracking-tight">{a.l}</span>
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover/chip:opacity-100 group-hover/chip:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start gap-2">
            <div className="w-5 h-5 rounded-md bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000]"><Bot size={12} /></div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex gap-1.5 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD000] animate-bounce"/>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD000] animate-bounce" style={{animationDelay: '0.1s'}}/>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD000] animate-bounce" style={{animationDelay: '0.2s'}}/>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#FFD000] to-[#E6AC00] rounded-2xl opacity-0 group-focus-within:opacity-20 transition-all duration-500" />
          <div className="relative flex items-center gap-2 bg-black rounded-2xl border border-white/10 p-2 focus-within:border-[#FFD000]/40 transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="How can I assist you today?"
              disabled={isTyping}
              className="flex-1 bg-transparent border-none text-[13px] font-medium px-4 py-3 outline-none text-white placeholder:text-white/20"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border-none cursor-pointer transition-all ${
                input.trim() && !isTyping ? 'bg-[#FFD000] text-dark-950 hover:bg-[#ffe44d] shadow-[0_0_15px_rgba(255,208,0,0.3)]' : 'bg-white/5 text-white/20'
              }`}
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-white/10 text-center font-bold uppercase tracking-[0.3em] mt-4">Powered by FETS-AI Engine</p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 208, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
