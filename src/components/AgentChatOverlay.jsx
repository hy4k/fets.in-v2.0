import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Calendar, ClipboardList, BookOpen, MapPin, X } from 'lucide-react';


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
    default: return { content: `I'm your exam assistant at FETS. I can help with dates, bookings, mock tests, and directions. What do you need?`,
      actions: actions([['Check Exam Dates', 'exam_dates', Calendar], ['Book an Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]) };
  }
}

const WELCOME = {
  id: 'w1', type: 'agent',
  content: `Hey! 👋 I'm **EXAM ASSIST** — your AI guide at FETS.\n\nLooking to book an exam, check dates, or take a mock test? Let's get you sorted.`,
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
      {/* Premium Dark Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          {/* Neural Orb Avatar */}
          <div className="chat-header-avatar">
            <div className="mini-orb">
              <div className="mini-orb-core"></div>
              <div className="mini-orb-ring"></div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '0.08em', marginBottom: '2px' }}>
              EXAM ASSIST
            </h3>
            <div className="chat-header-status">
              <span className="chat-header-status-dot"></span>
              Online
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={msg.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}>
              {msg.content.split('\n').map((l, i) => l === '' ? <div key={i} className="h-1"/> : (
                <p key={i}>
                  {l.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith('**') ? <strong key={j} style={{ fontWeight: 700 }}>{p.slice(2,-2)}</strong> : <span key={j}>{p}</span>)}
                </p>
              ))}
              
              {msg.type === 'agent' && msg.showActions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {msg.actions ? msg.actions.map((a, i) => (
                    <button key={i} onClick={() => handleChip(a.intent, a.label)} className="chat-action-chip">
                      <a.icon size={11}/>{a.label}
                    </button>
                  )) : [
                    { l: 'Check Dates', i: 'exam_dates', I: Calendar },
                    { l: 'Book Exam', i: 'book_exam', I: ClipboardList },
                    { l: 'Mocks', i: 'mock_exams', I: BookOpen },
                  ].map((a, i) => (
                    <button key={i} onClick={() => handleChip(a.i, a.l)} className="chat-action-chip">
                      <a.I size={11}/>{a.l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-typing">
              <div className="chat-typing-dot"></div>
              <div className="chat-typing-dot"></div>
              <div className="chat-typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask me anything about exams..."
            disabled={isTyping}
            className="chat-input-field"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`chat-send-btn ${input.trim() && !isTyping ? 'chat-send-btn--active' : 'chat-send-btn--inactive'}`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
