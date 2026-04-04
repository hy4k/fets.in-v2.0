import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Calendar, ClipboardList, BookOpen, X, Bot, User, ArrowRight, Minus, Maximize2 } from 'lucide-react';

/* ── Intent Detection ─────────────────────────────────────────────────────── */
function detectIntent(text) {
  const l = text.toLowerCase().trim();
  if (/exam\s*date|when.*exam|calendar|availab/.test(l)) return 'exam_dates';
  if (/book|register|reserve|enroll|seat/.test(l))       return 'book_exam';
  if (/mock|practice|sample/.test(l))                    return 'mock_exams';
  if (/contact|location|address|where/.test(l))          return 'contact';
  if (/cma|celpip|ielts|toefl|gre|acca|mrcs|aws/.test(l)) return 'exam_info';
  return 'unknown';
}

function respond(intent) {
  const actions = (list) => list.map((a) => ({ label: a[0], intent: a[1], icon: a[2] }));
  switch (intent) {
    case 'exam_dates': return {
      content: `Opening the live calendar — explore all available slots for CMA, CELPIP, and more.`,
      openPanel: 'exam-dates',
      actions: actions([['Book a Seat', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]),
    };
    case 'book_exam': return {
      content: `Let's secure your seat. Opening the booking portal — pick your centre and date.`,
      openPanel: 'booking',
      actions: actions([['Check Dates First', 'exam_dates', Calendar]]),
    };
    case 'mock_exams': return {
      content: `Full-simulation mocks under real exam conditions at our certified centres.`,
      openPanel: 'mock-exams',
      actions: actions([['Book Exam', 'book_exam', ClipboardList]]),
    };
    case 'contact': return {
      content: `Our centres:\n\n📍 **Calicut** — Kadooli Tower, West Nadakkavu\n📍 **Kochi** — K7 Corporate Towers\n📞 +91 9605686000`,
      openPanel: 'contact',
      actions: actions([['Book Exam', 'book_exam', ClipboardList]]),
    };
    case 'exam_info': return {
      content: `FETS is Kerala's premier testing partner — Prometric, Pearson VUE, IELTS, CMA, ACCA and more. Want to check seat availability?`,
      actions: actions([['Check Dates', 'exam_dates', Calendar], ['Book', 'book_exam', ClipboardList]]),
    };
    default: return {
      content: `I can help you check exam dates, book a seat, or explore mock tests. What would you like to do?`,
      actions: actions([
        ['Check Exam Dates', 'exam_dates', Calendar],
        ['Book an Exam',     'book_exam',  ClipboardList],
        ['Mock Tests',       'mock_exams', BookOpen],
      ]),
    };
  }
}

const WELCOME = {
  id: 'w0', type: 'agent',
  content: `Hi! 👋 I'm the **FETS Assistant**. I can help with exam dates, bookings, and mock tests.`,
  showActions: true,
  actions: [
    { label: 'Check Exam Dates', intent: 'exam_dates', icon: Calendar },
    { label: 'Book an Exam',     intent: 'book_exam',  icon: ClipboardList },
    { label: 'Mock Tests',       intent: 'mock_exams', icon: BookOpen },
  ],
};

/* ── Popup dimensions ─────────────────────────────────────────────────────── */
const W = 340;
const H = 480;

export default function AgentChatOverlay({ onClose, onOpenPanel }) {
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, window.innerWidth  - W - 88),
    y: Math.max(0, window.innerHeight - H - 160),
  }));

  const isDragging = useRef(false);
  const origin     = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const bottomRef  = useRef(null);

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, minimized]);

  /* drag */
  const onHeaderDown = (e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    origin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - origin.current.mx;
      const dy = e.clientY - origin.current.my;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - W,  origin.current.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 52, origin.current.py + dy)),
      });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  /* chat */
  const fire = useCallback((intent) => {
    setIsTyping(true);
    const res = respond(intent);
    setTimeout(() => {
      setMessages((p) => [...p, { id: `a-${Date.now()}`, type: 'agent', content: res.content, actions: res.actions, showActions: !!res.actions }]);
      setIsTyping(false);
      if (res.openPanel) onOpenPanel(res.openPanel);
    }, 700);
  }, [onOpenPanel]);

  const send = () => {
    if (!input.trim() || isTyping) return;
    const t = input.trim(); setInput('');
    setMessages((p) => [...p, { id: `u-${Date.now()}`, type: 'user', content: t }]);
    fire(detectIntent(t));
  };

  const chip = (intent, label) => {
    setMessages((p) => [...p, { id: `u-${Date.now()}`, type: 'user', content: label }]);
    fire(intent);
  };

  /* message text renderer */
  const renderText = (content) =>
    content.split('\n').map((line, i) =>
      line === '' ? <div key={i} className="h-2" /> : (
        <p key={i} className="leading-snug">
          {line.split(/(\*\*[^*]+\*\*)/).map((s, j) =>
            s.startsWith('**') ? <strong key={j} className="font-semibold">{s.slice(2, -2)}</strong> : s
          )}
        </p>
      )
    );

  return (
    <div
      style={{ position: 'fixed', left: pos.x, top: pos.y, width: W, zIndex: 200 }}
      className="flex flex-col overflow-hidden"
      aria-label="FETS AI Assistant"
    >
      {/* ── Outer card with layered shadow ── */}
      <div
        className="flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          height: minimized ? 'auto' : H,
        }}
      >
        {/* ── Header ── */}
        <div
          onMouseDown={onHeaderDown}
          style={{ cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
          className="flex items-center justify-between px-4 py-3 shrink-0"
          onMouseUp={() => {}}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#FFD000 0%,#CC9900 100%)' }}>
                <Bot size={16} strokeWidth={2.5} className="text-black" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-white leading-none tracking-wide">Exam Assist</p>
              <p className="text-[10px] text-white/35 mt-0.5 leading-none">FETS · Online</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setMinimized(!minimized)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              title={minimized ? 'Expand' : 'Minimise'}
            >
              {minimized ? <Maximize2 size={12} /> : <Minus size={12} />}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              title="Close"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* thin separator */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />

        {/* ── Body ── */}
        {!minimized && (
          <>
            {/* Messages scroll area */}
            <div
              className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] ${
                      msg.type === 'user'
                        ? 'rounded-br-sm text-[#0a0a0a] font-medium'
                        : 'rounded-bl-sm text-white/75'
                    }`}
                    style={msg.type === 'user'
                      ? { background: '#FFD000' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }
                    }
                  >
                    {renderText(msg.content)}

                    {/* Quick-action chips inside agent bubbles */}
                    {msg.type === 'agent' && msg.showActions && msg.actions?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {msg.actions.map((a, i) => (
                          <button
                            key={i}
                            onClick={() => chip(a.intent, a.label)}
                            className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[11px] font-semibold text-white/60 hover:text-[#FFD000] transition-all group"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,208,0,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                          >
                            <div className="flex items-center gap-2">
                              <a.icon size={12} />
                              {a.label}
                            </div>
                            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start">
                  <div
                    className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {[0, 0.15, 0.3].map((d, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#FFD000]/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* thin separator */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />

            {/* ── Input bar ── */}
            <div className="px-3 py-3 shrink-0" style={{ background: '#0e0e0e' }}>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={() => {}}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask anything…"
                  disabled={isTyping}
                  className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-white placeholder:text-white/25 font-medium"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isTyping}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0"
                  style={input.trim() && !isTyping
                    ? { background: '#FFD000', color: '#0a0a0a' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }
                  }
                >
                  <Send size={13} strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-center mt-2" style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                FETS · AI Assistant
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
