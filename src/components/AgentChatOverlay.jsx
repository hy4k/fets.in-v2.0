import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Calendar, ClipboardList, BookOpen, MapPin, Sparkles, X } from 'lucide-react';


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
    case 'exam_dates': return { content: `I'll open the calendar! You can browse all available slots for CMA, CELPIP, and other exams.`, openPanel: 'exam-dates',
      actions: actions([['Book Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]) };
    case 'book_exam': return { content: `Let's book your exam. I'll open the booking form to get your details and preferred slot.`, openPanel: 'booking',
      actions: actions([['Check Dates First', 'exam_dates', Calendar]]) };
    case 'mock_exams': return { content: `We offer full real-condition mock tests! CMA, CELPIP, IELTS, and more. Opening the list now.`, openPanel: 'mock-exams',
      actions: actions([['Book Exam', 'book_exam', ClipboardList]]) };
    case 'contact': return { content: `We have state-of-the-art centres in Calicut and Kochi.\n📍 +91 9605686000\n\nI'll open the map and directions!`, openPanel: 'contact',
      actions: actions([['Book Exam', 'book_exam', ClipboardList]]) };
    case 'exam_info': return { content: `We are the premier testing partner in Kerala. We offer Prometric, Pearson VUE, CELPIP, CMA, IELTS and more.\n\nWant to check dates or book?`,
      actions: actions([['Check Dates', 'exam_dates', Calendar], ['Book', 'book_exam', ClipboardList]]) };
    default: return { content: `I'm FETS AI, your exam assistant. I can help with dates, bookings, mocks, and locations. Try one of these:`,
      actions: actions([['Check Exam Dates', 'exam_dates', Calendar], ['Book an Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]) };
  }
}

const WELCOME = {
  id: 'w1', type: 'agent',
  content: `Hi there! 👋 I'm **EXAM ASSIST**.\n\nLooking to book an exam, check dates, or take a mock test? I can get you sorted in seconds.`,
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
    }, 700);
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
    <div className="chat-overlay">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-300 bg-light-50 shadow-sm z-10" style={{borderColor: 'var(--color-light-300)'}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dark-950 flex items-center justify-center text-primary-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-950 tracking-wide">EXAM ASSIST</h3>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">AI Agent Online</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-light-200 flex items-center justify-center text-dark-800 hover:bg-light-300 transition-colors border-none cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 bg-light-100 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.type === 'user' 
                ? 'bg-primary-400 text-dark-950 rounded-tr-sm font-medium shadow-sm' 
                : 'bg-light-50 text-dark-900 border border-light-300 rounded-tl-sm shadow-sm'
            }`}>
              {msg.content.split('\n').map((l, i) => l === '' ? <div key={i} className="h-1"/> : (
                <p key={i}>
                  {l.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith('**') ? <strong key={j} className="font-bold">{p.slice(2,-2)}</strong> : <span key={j}>{p}</span>)}
                </p>
              ))}
              
              {msg.type === 'agent' && msg.showActions && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-light-200">
                  {msg.actions ? msg.actions.map((a, i) => (
                    <button key={i} onClick={() => handleChip(a.intent, a.label)} className="text-xs font-semibold bg-light-200 hover:bg-primary-400 hover:text-dark-950 text-dark-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border-none cursor-pointer">
                      <a.icon size={12}/>{a.label}
                    </button>
                  )) : [
                    { l: 'Check Dates', i: 'exam_dates', I: Calendar },
                    { l: 'Book Exam', i: 'book_exam', I: ClipboardList },
                    { l: 'Mocks', i: 'mock_exams', I: BookOpen },
                  ].map((a, i) => (
                    <button key={i} onClick={() => handleChip(a.i, a.l)} className="text-xs font-semibold bg-light-200 hover:bg-primary-400 hover:text-dark-950 text-dark-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border-none cursor-pointer">
                      <a.I size={12}/>{a.l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-light-50 border border-light-300 rounded-2xl rounded-tl-sm p-4 flex gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce"/>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{animationDelay: '0.1s'}}/>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{animationDelay: '0.2s'}}/>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-light-50 border-t border-light-300">
        <div className="flex items-center gap-2 bg-light-100 rounded-xl border border-light-200 p-1 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask me anything..."
            disabled={isTyping}
            className="flex-1 bg-transparent border-none text-sm px-3 py-2 outline-none text-dark-900 placeholder:text-dark-900/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border-none cursor-pointer transition-all ${
              input.trim() && !isTyping ? 'bg-primary-400 text-dark-950 hover:bg-primary-500' : 'bg-light-200 text-dark-900/40'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
