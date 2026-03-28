import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Calendar, ClipboardList, BookOpen, MapPin, HelpCircle, Sparkles } from 'lucide-react';
import AgentAvatar from './AgentAvatar';
import TypingIndicator from './TypingIndicator';
import { examDates, mockExams, faqData, centers } from '../data/siteData';

/* ===== INTENT DETECTION ===== */
function detectIntent(text) {
  const l = text.toLowerCase().trim();
  if (/exam\s*date|when.*exam|available.*date|schedule|calendar|upcoming|next.*exam|check.*date|show.*date/.test(l)) return 'exam_dates';
  if (/book|register|slot|reserve|enroll|sign\s*up.*exam|want.*take|schedule.*exam/.test(l)) return 'book_exam';
  if (/mock|practice|sample|prep|test.*practice|preparation/.test(l)) return 'mock_exams';
  if (/contact|location|address|where|reach|direction|map|phone|call|email|centre|center|kochi|calicut|kozhikode|visit/.test(l)) return 'contact';
  if (/id|bring|document|identity/.test(l)) return 'faq_id';
  if (/early|arrive|before|time.*arrive/.test(l)) return 'faq_arrive';
  if (/reschedule|cancel|change.*date/.test(l)) return 'faq_reschedule';
  if (/prohibit|not.*allow|restrict/.test(l)) return 'faq_prohibited';
  if (/result|score|when.*get/.test(l)) return 'faq_results';
  if (/faq|question|help|frequently/.test(l)) return 'faq';
  if (/fee|price|cost|how\s*much|charge/.test(l)) return 'pricing';
  if (/cma/.test(l)) return 'exam_info_cma';
  if (/celpip/.test(l)) return 'exam_info_celpip';
  if (/ielts/.test(l)) return 'exam_info_ielts';
  if (/toefl/.test(l)) return 'exam_info_toefl';
  if (/gre/.test(l)) return 'exam_info_gre';
  if (/acca/.test(l)) return 'exam_info_acca';
  if (/mrcs/.test(l)) return 'exam_info_mrcs';
  if (/aws|amazon/.test(l)) return 'exam_info_aws';
  if (/microsoft/.test(l)) return 'exam_info_microsoft';
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|yo)/.test(l)) return 'greeting';
  if (/thank|thanks|thx/.test(l)) return 'thanks';
  return 'unknown';
}

/* ===== RESPONSE GENERATION ===== */
function respond(intent) {
  const actions = (list) => list.map((a) => ({ label: a[0], intent: a[1], icon: a[2] }));
  switch (intent) {
    case 'exam_dates': {
      const upcoming = examDates.filter((d) => d.status !== 'booked').slice(0, 6);
      const names = [...new Set(upcoming.map((d) => d.exam))].join(', ');
      return { content: `Here are the available exam dates! We have slots for **${names}** across Calicut and Kochi.\n\nI'll open the full calendar — filter by exam type and month.`, openPanel: 'exam-dates', highlight: null,
        actions: actions([['Book an Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen]]) };
    }
    case 'book_exam':
      return { content: `I'll help you book an exam! 🎯\n\nThe booking form lets you:\n• Select your exam\n• Choose centre (Calicut / Kochi)\n• Pick a date\n• Provide your details\n\nOur team confirms within 24 hours.`, openPanel: 'booking',
        actions: actions([['Check Dates First', 'exam_dates', Calendar], ['View Pricing', 'pricing', Sparkles]]) };
    case 'mock_exams': {
      const names = mockExams.slice(0, 3).map((m) => m.name).join(', ');
      return { content: `Practice makes perfect! 📚\n\nWe offer mock exams including **${names}** and more — simulating real exam conditions.\n\nLet me show you the full list.`, openPanel: 'mock-exams',
        actions: actions([['Book an Exam', 'book_exam', ClipboardList], ['Check Dates', 'exam_dates', Calendar]]) };
    }
    case 'contact': {
      const cal = centers.find((c) => c.id === 'calicut'), koc = centers.find((c) => c.id === 'kochi');
      return { content: `We have two centres:\n\n📍 **Calicut** — ${cal.address}\n📍 **Kochi** — ${koc.address}\n\n📞 **+91 9605686000** · ✉️ **edu@fets.in**\n⏰ Mon–Sun, 8 AM – 6 PM\n\nOpening location details now!`, openPanel: 'contact',
        actions: actions([['Book an Exam', 'book_exam', ClipboardList]]) };
    }
    case 'faq': return { content: `I can answer common questions:\n\n• What ID do I need?\n• How early should I arrive?\n• Can I reschedule?\n• What items are prohibited?\n• When do results come?\n\nJust ask! 😊`,
      actions: actions([['What ID do I need?', 'faq_id', HelpCircle], ['How early to arrive?', 'faq_arrive', HelpCircle]]) };
    case 'faq_id': return { content: faqData[0].a, actions: actions([['Book Exam', 'book_exam', ClipboardList]]) };
    case 'faq_arrive': return { content: faqData[1].a, actions: actions([['Book Exam', 'book_exam', ClipboardList]]) };
    case 'faq_reschedule': return { content: faqData[2].a, actions: actions([['Contact Us', 'contact', MapPin]]) };
    case 'faq_prohibited': return { content: faqData[3].a, actions: actions([['Our Locations', 'contact', MapPin]]) };
    case 'faq_results': return { content: faqData[4].a, actions: actions([['Contact Us', 'contact', MapPin]]) };
    case 'pricing': return { content: `Exam fees overview:\n\n• CMA US — ₹15,000\n• CELPIP General — ₹12,000\n• IELTS — ₹16,500\n• TOEFL iBT — ₹13,500\n• GRE General — ₹22,000\n• ACCA — ₹8,500\n• MRCS Part A — ₹25,000\n• AWS / Microsoft — ₹5,000\n\n*Final fees may vary.*`,
      actions: actions([['Book an Exam', 'book_exam', ClipboardList], ['Check Dates', 'exam_dates', Calendar]]) };
    case 'exam_info_cma': return { content: `**CMA US** (Certified Management Accountant) 🏆\n\nAuthorized Prometric centre. Part 1 (Financial Planning) and Part 2 (Strategic Management).\n\n• Fee: ~₹15,000/part · Duration: 4 hours\n• Mock tests available!`, highlight: 'cma',
      actions: actions([['Check CMA Dates', 'exam_dates', Calendar], ['Book CMA', 'book_exam', ClipboardList], ['CMA Mock', 'mock_exams', BookOpen]]) };
    case 'exam_info_celpip': return { content: `**CELPIP** — Essential for Canadian immigration! 🇨🇦\n\n• General — ₹12,000 · LS — ₹9,000\n• Tests: Listening, Reading, Writing, Speaking\n• One of few CELPIP centres in Kerala!`, highlight: 'celpip',
      actions: actions([['Check CELPIP Dates', 'exam_dates', Calendar], ['Book CELPIP', 'book_exam', ClipboardList]]) };
    case 'exam_info_ielts': return { content: `**IELTS** — World's most popular English test! 🌍\n\n• Academic & General Training · Fee: ~₹16,500\n• 4 modules: Listening, Reading, Writing, Speaking\n• Mock tests available for practice`, highlight: 'ielts',
      actions: actions([['Check IELTS Dates', 'exam_dates', Calendar], ['Book IELTS', 'book_exam', ClipboardList]]) };
    case 'exam_info_toefl': case 'exam_info_gre': case 'exam_info_acca':
    case 'exam_info_mrcs': case 'exam_info_aws': case 'exam_info_microsoft': {
      const id = intent.replace('exam_info_', '');
      const name = id.toUpperCase();
      return { content: `We offer **${name}** at our centres! Authorized by the relevant testing body with a world-class environment.\n\nWould you like to check dates or book?`, highlight: id,
        actions: actions([['Check Dates', 'exam_dates', Calendar], ['Book Exam', 'book_exam', ClipboardList]]) };
    }
    case 'greeting': return { content: `Hey there! 👋 Welcome to **FETS**.\n\nI can help with:\n🗓️ Exam dates · 📋 Booking · 📚 Mock tests · 📍 Locations · ❓ FAQs\n\nYou can also click any exam card on the left to ask me about it!` };
    case 'thanks': return { content: `You're welcome! 😊 Anything else I can help with?`,
      actions: actions([['Check Dates', 'exam_dates', Calendar], ['Book', 'book_exam', ClipboardList]]) };
    default: return { content: `I'm best at helping with exam dates, bookings, mock tests, and centre info. Try one of these:`,
      actions: actions([['Check Exam Dates', 'exam_dates', Calendar], ['Book an Exam', 'book_exam', ClipboardList], ['Mock Tests', 'mock_exams', BookOpen], ['Our Locations', 'contact', MapPin], ['FAQs', 'faq', HelpCircle]]) };
  }
}

/* ===== COMPONENT ===== */
const WELCOME = {
  id: 'welcome', type: 'agent',
  content: `Hi! I'm **FETS AI** 👋 — your exam navigator.\n\nI can help with dates, bookings, mock tests, and more. Click an exam card on the left, or just ask me anything!`,
  showActions: true,
};

export default function AgentChat({ onOpenPanel, contextBridge, onHighlight }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Cross-panel: handle context from left panel
  useEffect(() => {
    if (!contextBridge) return;
    const { type, name, id } = contextBridge;
    let userText, intent;
    if (type === 'exam') {
      userText = `Tell me about ${name}`;
      intent = `exam_info_${id}`;
    } else if (type === 'location') {
      userText = `Show me the ${name} centre`;
      intent = 'contact';
    } else return;
    addUserMsg(userText);
    processIntent(intent);
  }, [contextBridge]);

  const addUserMsg = (text) => {
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, type: 'user', content: text }]);
  };

  const processIntent = useCallback((intent) => {
    setIsTyping(true);
    const res = respond(intent);
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`, type: 'agent', content: res.content,
        actions: res.actions, showActions: !!res.actions,
      }]);
      setIsTyping(false);
      if (res.highlight) onHighlight?.(res.highlight);
      if (res.openPanel) setTimeout(() => onOpenPanel(res.openPanel), 350);
    }, delay);
  }, [onOpenPanel, onHighlight]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    addUserMsg(text);
    processIntent(detectIntent(text));
  };

  const handleChip = (intent, label) => {
    addUserMsg(label);
    processIntent(intent);
  };

  const renderContent = (text) =>
    text.split('\n').map((line, i) => (
      <p key={i} className={line === '' ? 'h-1.5' : ''}>
        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )}
      </p>
    ));

  return (
    <>
      {/* Messages */}
      <div className="chat-area">
        <div className="messages-inner">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'agent' ? (
                <div className="msg-agent">
                  <AgentAvatar />
                  <div>
                    <div className="msg-agent-bubble">{renderContent(msg.content)}</div>
                    {msg.showActions && msg.actions && (
                      <div className="quick-actions">
                        {msg.actions.map((a, i) => {
                          const Icon = a.icon || Sparkles;
                          return (
                            <button key={i} className="quick-chip" onClick={() => handleChip(a.intent, a.label)}>
                              <Icon size={12} />{a.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {msg.showActions && !msg.actions && (
                      <div className="quick-actions">
                        {[
                          { label: 'Check Exam Dates', intent: 'exam_dates', icon: Calendar },
                          { label: 'Book an Exam', intent: 'book_exam', icon: ClipboardList },
                          { label: 'Mock Tests', intent: 'mock_exams', icon: BookOpen },
                          { label: 'Our Locations', intent: 'contact', icon: MapPin },
                          { label: 'FAQs', intent: 'faq', icon: HelpCircle },
                        ].map((a, i) => (
                          <button key={i} className="quick-chip" onClick={() => handleChip(a.intent, a.label)}>
                            <a.icon size={12} />{a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="msg-user">
                  <div className="msg-user-bubble">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="chat-input-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask me anything about exams..."
            className="chat-input"
            rows={1}
            disabled={isTyping}
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="chat-send-btn">
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
