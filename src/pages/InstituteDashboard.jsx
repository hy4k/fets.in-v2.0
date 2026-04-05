import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp, ChevronRight,
  Building2, LogOut, Users, BookOpen, Clock, Upload, Download,
  FileSpreadsheet, Plus, Trash2, ArrowRight, Trophy,
  LayoutDashboard, GraduationCap, TrendingUp, Menu, BarChart3,
  Calendar, Bell, Award, Target, Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateAccessCode(instituteName = '') {
  const firstWord = instituteName.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${firstWord || 'FETS'}2026`;
}

// Period grouping
const BI_PERIODS = ['Jan – Feb', 'Mar – Apr', 'May – Jun', 'Jul – Aug', 'Sep – Oct', 'Nov – Dec'];
function periodLabel(dateStr) {
  if (!dateStr) return 'Undated';
  const d = new Date(String(dateStr).includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d)) return 'Undated';
  return `${BI_PERIODS[Math.floor(d.getMonth() / 2)]} ${d.getFullYear()}`;
}
function groupByPeriod(items, getDate) {
  const map = {};
  for (const item of items) {
    const key = periodLabel(getDate(item));
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return Object.entries(map).sort((a, b) => {
    const pk = k => { const y = parseInt(k.slice(-4)); const p = BI_PERIODS.findIndex(x => k.startsWith(x)); return y * 10 + p; };
    return pk(b[0]) - pk(a[0]);
  });
}

// ─── Shared classes ───────────────────────────────────────────────────────────

const GLASS = 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-2xl border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.09)]';
const GLASS_SM = 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]';
const inputCls = 'w-full px-4 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/15 transition-all text-sm font-medium backdrop-blur-sm';
const labelCls = 'block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest';

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ value }) {
  const map = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm ${map[value] || 'bg-white/[0.06] text-white/40 border-white/[0.10]'}`}>
      {value || 'pending'}
    </span>
  );
}

function ResultBadge({ value }) {
  const map = {
    pass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    fail: 'bg-red-500/15 text-red-400 border-red-500/25',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm ${map[value] || 'bg-white/[0.06] text-white/40 border-white/[0.10]'}`}>
      {value || 'pending'}
    </span>
  );
}

// ─── Background Blobs ─────────────────────────────────────────────────────────

function BgBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#FFD000]/[0.07] blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[20%] -right-60 w-[600px] h-[600px] rounded-full bg-blue-500/[0.06] blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute -bottom-40 left-[25%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.05] blur-[110px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      <div className="absolute top-[60%] left-[50%] w-[400px] h-[400px] rounded-full bg-teal-500/[0.04] blur-[100px]" />
    </div>
  );
}

// ─── Entry Screen ─────────────────────────────────────────────────────────────

function EntryScreen({ onAccessSuccess, onRegister }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter your access code.'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: dbErr } = await supabase
        .from('coaching_centers').select('*')
        .eq('access_code', code.trim().toUpperCase()).eq('is_active', true).maybeSingle();
      if (dbErr) throw dbErr;
      if (!data) throw new Error('Invalid or inactive access code. Contact FETS for your code.');
      onAccessSuccess(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <BgBlobs />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Brand */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${GLASS} mb-6`}>
            <span className="font-black text-[#FFD000] text-2xl tracking-tight">FETS</span>
            <span className="w-px h-6 bg-white/[0.12]" />
            <span className="text-white/50 font-bold text-sm tracking-widest uppercase">Institute Portal</span>
          </div>
          <p className="text-white/30 text-sm font-medium">Partner dashboard for coaching centres & institutes</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Access code */}
          <div className={`${GLASS} rounded-3xl p-8`}>
            <div className="w-14 h-14 rounded-2xl bg-[#FFD000]/15 border border-[#FFD000]/25 flex items-center justify-center text-[#FFD000] mb-6 shadow-[0_0_20px_rgba(255,208,0,0.15)]">
              <Building2 size={24} />
            </div>
            <h2 className="text-white font-black text-xl mb-2 tracking-tight">Access Dashboard</h2>
            <p className="text-white/40 text-sm mb-7 leading-relaxed">Enter your institute's unique access code to manage bookings and view results.</p>
            <form onSubmit={handleAccess} className="space-y-4">
              <input
                type="text" value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BRILLIANT2026"
                className={`${inputCls} text-center tracking-[0.25em] text-lg font-black uppercase`}
                autoComplete="off" spellCheck={false}
              />
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(255,208,0,0.25)] disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Access Dashboard</span> <ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          {/* Register */}
          <div className={`${GLASS} rounded-3xl p-8 flex flex-col`}>
            <div className="w-14 h-14 rounded-2xl bg-white/[0.07] border border-white/[0.10] flex items-center justify-center text-white/50 mb-6">
              <Plus size={24} />
            </div>
            <h2 className="text-white font-black text-xl mb-2 tracking-tight">Register Institute</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-3">New to FETS? Register your institute and get your unique access code.</p>
            <p className="text-white/20 text-xs font-medium mb-4">Free &bull; Instant access code &bull; No credit card</p>
            <div className="mt-auto space-y-3">
              {['Manage bulk CMA mock bookings', 'View student exam results', 'Track booking status'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-xs text-white/40">
                  <div className="w-4 h-4 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/20 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFD000]/60" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={onRegister}
              className="mt-6 w-full py-4 rounded-2xl bg-white/[0.07] border border-white/[0.12] text-white font-black text-sm uppercase tracking-widest hover:bg-white/[0.11] hover:border-white/20 transition-all"
            >Register Now →</button>
          </div>
        </div>

        <p className="mt-10 text-white/20 text-xs text-center">
          For support: <a href="mailto:mithun@fets.in" className="text-white/30 hover:text-[#FFD000]/70 transition-colors">mithun@fets.in</a>
        </p>
      </div>
    </div>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────

function RegisterScreen({ onSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Calicut');
  const [generatedCode, setGeneratedCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !contactPerson || !email || !phone) { setError('Please fill all required fields.'); return; }
    setLoading(true); setError('');
    const code = generateAccessCode(name);
    try {
      const { error: dbErr } = await supabase.from('coaching_centers').insert({
        name, contact: phone, email, city, contact_name: contactPerson,
        access_code: code, is_active: true,
      });
      if (dbErr) throw dbErr;
      setGeneratedCode(code); setSuccess(true);
    } catch (err) { setError(err.message || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (success) return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <BgBlobs />
      <div className={`relative z-10 w-full max-w-md ${GLASS} rounded-3xl p-10 text-center`}>
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">You're in!</h1>
        <p className="text-white/40 mb-8 text-sm leading-relaxed">Save your access code — you'll use it every time you log in to the portal.</p>

        <div className={`${GLASS_SM} rounded-2xl p-7 mb-6`}>
          <p className="text-[10px] font-black text-[#FFD000]/50 uppercase tracking-[0.3em] mb-3">Your Access Code</p>
          <p className="font-mono font-black text-[#FFD000] text-3xl tracking-[0.3em] mb-1">{generatedCode}</p>
          <div className="mt-3 h-px bg-white/[0.06]" />
          <p className="text-white/25 text-xs mt-3 font-medium">This is your institute's permanent login key</p>
        </div>

        <div className="space-y-3">
          <button onClick={handleCopy}
            className="w-full py-3.5 rounded-2xl bg-white/[0.07] border border-white/[0.12] text-white font-bold text-sm hover:bg-white/[0.10] transition-all flex items-center justify-center gap-2"
          >
            {copied ? <><CheckCircle2 size={15} className="text-emerald-400" /> Copied!</> : <><Copy size={15} /> Copy Access Code</>}
          </button>
          <button onClick={() => onSuccess(generatedCode)}
            className="w-full py-3.5 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
          >Open Dashboard →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-lg">
        <button onClick={onBack} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8">
          ← Back
        </button>
        <div className={`${GLASS} rounded-3xl p-8`}>
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000] text-[10px] font-black uppercase tracking-widest mb-4">
              <Zap size={10} /> New Registration
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1.5">Register Your Institute</h1>
            <p className="text-white/40 text-sm leading-relaxed">Join the FETS partner network and manage your CMA mock exams.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Institute Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. ABC Commerce Academy" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contact Person *</label>
              <input type="text" required value={contactPerson} onChange={e => setContactPerson(e.target.value)}
                placeholder="Your full name" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="institute@email.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 …" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>City</label>
              <select value={city} onChange={e => setCity(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="Calicut">Calicut</option>
                <option value="Kochi">Kochi</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_8px_24px_rgba(255,208,0,0.2)] disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin text-[#0a0a0a]" /> : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Booking Modal ───────────────────────────────────────────────────────

function BulkBookingModal({ center, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [examPart, setExamPart] = useState('Part 1');
  const [preferredDate, setPreferredDate] = useState('');
  const [sessionTime, setSessionTime] = useState('Morning (9:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_center');
  const [rosterMethod, setRosterMethod] = useState('manual');
  const [students, setStudents] = useState(['', '']);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Student Name', 'CMA Part', 'Email', 'Phone'],
      ['John Doe', 'Part 1', 'john@email.com', '9876543210'],
    ]);
    ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 28 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'FETS_Bulk_Booking_Template.xlsx');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setParsedStudents(rows.slice(1).filter(r => r[0]));
    };
    reader.readAsBinaryString(file);
  };

  const addStudent = () => setStudents(s => [...s, '']);
  const removeStudent = (i) => setStudents(s => s.filter((_, idx) => idx !== i));
  const updateStudent = (i, v) => setStudents(s => s.map((x, idx) => idx === i ? v : x));

  const finalStudents = rosterMethod === 'excel'
    ? parsedStudents.map(r => String(r[0] || '').trim()).filter(Boolean)
    : students.map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!preferredDate) { setError('Please select a preferred date.'); return; }
    if (!finalStudents.length) { setError('Please add at least one student.'); return; }
    setLoading(true); setError('');
    try {
      const { data: booking, error: bErr } = await supabase.from('cma_mock_bookings').insert({
        booking_type: 'institutional',
        coaching_center_id: center.id,
        exam_part: examPart,
        preferred_date: preferredDate,
        session_time: sessionTime,
        payment_method: paymentMethod,
        student_count: finalStudents.length,
      }).select().single();
      if (bErr) throw bErr;
      const { error: sErr } = await supabase.from('cma_mock_students').insert(
        finalStudents.map(name => ({ booking_id: booking.id, student_name: name }))
      );
      if (sErr) throw sErr;
      setStep(3);
    } catch (err) { setError(err.message || 'Booking failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const steps = [
    { n: 1, label: 'Exam Details' },
    { n: 2, label: 'Student Roster' },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className={`w-full max-w-xl ${GLASS} rounded-3xl flex flex-col max-h-[92vh] overflow-hidden`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        {step !== 3 && (
          <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.08] shrink-0">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Bulk Mock Booking</h2>
              <p className="text-xs text-white/40 mt-0.5 font-medium">{center.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Step pills */}
              <div className="hidden sm:flex items-center gap-2">
                {steps.map((s, i) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                      step === 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25'
                      : step >= s.n ? 'bg-[#FFD000]/20 text-[#FFD000] border border-[#FFD000]/25'
                      : 'bg-white/[0.06] text-white/25 border border-white/[0.08]'
                    }`}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">
                        {step === 3 ? '✓' : s.n}
                      </span>
                      <span className="uppercase tracking-wider hidden sm:block">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <ChevronRight size={12} className="text-white/20" />}
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/[0.08] transition-all"><X size={18} /></button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-7">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-5">Exam Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Exam Part</label>
                  <select value={examPart} onChange={e => setExamPart(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                    <option>Part 1</option><option>Part 2</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Preferred Date</label>
                  <input type="date" required value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                    className={inputCls} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Session Time</label>
                  <select value={sessionTime} onChange={e => setSessionTime(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                    <option>Morning (9:00 AM)</option>
                    <option>Noon (1:00 PM)</option>
                    <option>Afternoon (3:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Payment</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                    <option value="pay_at_center">Pay at Center</option>
                    <option value="online">Online Transfer</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
              <button
                onClick={() => { if (!preferredDate) { setError('Please select a date.'); return; } setError(''); setStep(2); }}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all mt-2 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
              >Next: Add Students <ArrowRight size={16} /></button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest">← Back</button>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Student Roster</p>
              </div>

              <div className="flex gap-1.5 mb-5 p-1 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
                {[['manual', '✏ Manual Entry'], ['excel', '📊 Excel Upload']].map(([m, l]) => (
                  <button key={m} onClick={() => setRosterMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${rosterMethod === m ? 'bg-[#FFD000] text-[#0a0a0a] shadow-md' : 'text-white/40 hover:text-white'}`}
                  >{l}</button>
                ))}
              </div>

              {rosterMethod === 'manual' ? (
                <div className="space-y-2.5">
                  {students.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-xs font-black text-white/20 text-right shrink-0">{i + 1}</span>
                      <input type="text" value={s} onChange={e => updateStudent(i, e.target.value)}
                        placeholder={`Student ${i + 1} full name`}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/40 transition-all text-sm backdrop-blur-sm"
                      />
                      {students.length > 1 && (
                        <button onClick={() => removeStudent(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors shrink-0"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={addStudent} className="flex items-center gap-2 text-xs font-bold text-white/30 hover:text-[#FFD000] transition-colors mt-2">
                    <Plus size={14} /> Add Student
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`${GLASS_SM} rounded-2xl p-4 flex items-start gap-4`}>
                    <FileSpreadsheet size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm mb-0.5">Excel Template Format</p>
                      <p className="text-white/40 text-xs">Col A: Student Name · Col B: CMA Part · Col C: Email · Col D: Phone</p>
                    </div>
                    <button onClick={downloadTemplate} className="text-[#FFD000]/70 hover:text-[#FFD000] transition-colors text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Download size={12} /> Template
                    </button>
                  </div>
                  <label className={`block w-full p-8 rounded-2xl ${GLASS_SM} border-dashed text-center cursor-pointer hover:border-[#FFD000]/30 hover:bg-[#FFD000]/[0.02] transition-all`}>
                    <Upload size={22} className="mx-auto text-white/25 mb-2" />
                    <p className="text-white/50 text-sm font-bold">Click to upload Excel</p>
                    <p className="text-white/20 text-xs mt-1">.xlsx or .xls</p>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
                  </label>
                  {parsedStudents.length > 0 && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                      <p className="text-emerald-400 text-xs font-black mb-3 uppercase tracking-widest">✓ {parsedStudents.length} students parsed</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {parsedStudents.map((row, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs text-white/60">
                            <span className="w-5 text-white/20 font-black">{i + 1}</span>
                            <span className="font-semibold text-white/70">{row[0]}</span>
                            {row[1] && <span className="text-white/30">· {row[1]}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-400 text-xs font-medium mt-4">{error}</p>}

              {finalStudents.length > 0 && (
                <div className={`mt-4 ${GLASS_SM} rounded-xl px-4 py-3 flex items-center justify-between`}>
                  <span className="text-xs text-white/50 font-medium">Ready to book</span>
                  <span className="text-sm font-black text-white">{finalStudents.length} student{finalStudents.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading || !finalStudents.length}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : `Confirm Booking (${finalStudents.length} Students)`}
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={38} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Booking Confirmed!</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                {finalStudents.length} students booked. FETS will confirm the session shortly.
              </p>
              <div className={`${GLASS_SM} rounded-2xl p-5 mb-6 text-left space-y-2.5`}>
                {[['Exam Part', examPart], ['Preferred Date', preferredDate], ['Session', sessionTime], ['Payment', paymentMethod === 'pay_at_center' ? 'Pay at Center' : 'Online Transfer']].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-white/40 font-medium">{k}</span>
                    <span className="text-white font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={onSuccess}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
              >Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function DashboardScreen({ center, onSignOut }) {
  const [nav, setNav] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: null, students: null, pending: null, passed: null });
  const [expanded, setExpanded] = useState(null);
  const [studentMap, setStudentMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});
  const [results, setResults] = useState([]);
  const [showBulkBooking, setShowBulkBooking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!center?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('cma_mock_bookings').select('*')
        .eq('coaching_center_id', center.id).order('created_at', { ascending: false });
      const rows = data || [];
      setBookings(rows);
      const { data: res } = await supabase.from('exam_results').select('*')
        .eq('coaching_center_id', center.id).order('uploaded_at', { ascending: false });
      const resRows = res || [];
      setResults(resRows);
      setStats({
        total: rows.length,
        students: rows.reduce((s, r) => s + (r.student_count || 0), 0),
        pending: rows.filter(r => (r.status || 'pending') === 'pending').length,
        passed: resRows.filter(r => r.result_status === 'pass').length,
      });
    } finally { setLoading(false); }
  }, [center?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (studentMap[id]) return;
    setLoadingStudents(p => ({ ...p, [id]: true }));
    const { data } = await supabase.from('cma_mock_students').select('student_name').eq('booking_id', id);
    setStudentMap(p => ({ ...p, [id]: data || [] }));
    setLoadingStudents(p => ({ ...p, [id]: false }));
  };

  // Aggregate all students across bookings
  const allStudents = Object.entries(studentMap).flatMap(([bookingId, students]) => {
    const booking = bookings.find(b => b.id === bookingId);
    return students.map(s => ({ ...s, exam_part: booking?.exam_part, preferred_date: booking?.preferred_date, status: booking?.status }));
  });

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: BookOpen, count: bookings.length },
    { id: 'results', label: 'Results', icon: Trophy, count: results.length },
    { id: 'students', label: 'Students', icon: GraduationCap },
  ];

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-black text-[#FFD000] text-xl tracking-tight">FETS</span>
          <span className="w-px h-5 bg-white/[0.10]" />
          <span className="text-white/30 font-bold text-[10px] uppercase tracking-widest">Institute</span>
        </div>
        <div className={`${GLASS_SM} rounded-xl px-3 py-2.5`}>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-lg bg-[#FFD000]/15 flex items-center justify-center shrink-0">
              <Building2 size={12} className="text-[#FFD000]" />
            </div>
            <p className="text-white font-bold text-xs truncate">{center.name}</p>
          </div>
          {center.city && <p className="text-white/30 text-[10px] ml-8">{center.city}</p>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { setNav(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all text-left group relative ${
              nav === item.id
                ? 'bg-gradient-to-r from-[#FFD000]/20 to-[#FFD000]/5 text-[#FFD000] shadow-[inset_0_1px_0_rgba(255,208,0,0.1),0_0_12px_rgba(255,208,0,0.1)]'
                : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {nav === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#FFD000] rounded-r-full" />}
            <item.icon size={16} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.count != null && item.count > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${nav === item.id ? 'bg-[#FFD000]/20 text-[#FFD000]' : 'bg-white/[0.06] text-white/30'}`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Book CTA */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <button
          onClick={() => setShowBulkBooking(true)}
          className="w-full flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000] text-sm font-black hover:bg-[#FFD000]/15 transition-all"
        >
          <Plus size={15} /> Book Mock Exam
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all text-xs font-semibold mt-1"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#07070f] text-white relative">
      <BgBlobs />

      <div className="flex min-h-screen relative z-10">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex w-60 xl:w-64 shrink-0 h-screen sticky top-0 flex-col ${GLASS} rounded-none border-l-0 border-t-0 border-b-0`}
          style={{ borderLeft: 'none', borderTop: 'none', borderBottom: 'none', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className={`absolute left-0 top-0 bottom-0 w-64 flex flex-col ${GLASS}`}>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Top header */}
          <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/[0.03] border-b border-white/[0.07] px-6 h-16 flex items-center justify-between shrink-0"
            style={{ boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-sm font-black text-white capitalize">{
                  nav === 'overview' ? 'Dashboard Overview' :
                  nav === 'bookings' ? 'Mock Exam Bookings' :
                  nav === 'results' ? 'Exam Results' : 'Student Roster'
                }</h1>
                <p className="text-[10px] text-white/30 hidden sm:block">{center.name} · {center.city || 'FETS Partner'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/30 hover:text-white hover:bg-white/[0.06] transition-all border border-white/[0.07]">
                <BarChart3 size={13} /> Refresh
              </button>
              <button onClick={() => setShowBulkBooking(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFD000] text-[#0a0a0a] text-xs font-black hover:bg-[#ffe44d] transition-all shadow-[0_0_16px_rgba(255,208,0,0.2)]">
                <Plus size={13} /> Book Exam
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-5 xl:p-8 overflow-auto">

            {/* ── OVERVIEW ── */}
            {nav === 'overview' && (
              <div className="space-y-8">
                {/* Welcome */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD000]/60 mb-1">Welcome back</p>
                  <h2 className="text-3xl font-black text-white tracking-tight">{center.name}</h2>
                  {center.city && <p className="text-white/30 text-sm mt-1">{center.city} · CMA Mock Exam Partner</p>}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Bookings', value: stats.total, icon: BookOpen, color: 'bg-[#FFD000]/15 text-[#FFD000]', glow: 'rgba(255,208,0,0.15)' },
                    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'bg-blue-500/15 text-blue-400', glow: 'rgba(59,130,246,0.15)' },
                    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'bg-amber-500/15 text-amber-400', glow: 'rgba(245,158,11,0.15)' },
                    { label: 'Students Passed', value: stats.passed, icon: Award, color: 'bg-emerald-500/15 text-emerald-400', glow: 'rgba(16,185,129,0.15)' },
                  ].map(s => (
                    <div key={s.label} className={`${GLASS} rounded-2xl p-5`}>
                      <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-4`}
                        style={{ boxShadow: `0 0 20px ${s.glow}` }}>
                        <s.icon size={18} />
                      </div>
                      <p className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                        {s.value === null || s.value === undefined
                          ? <Loader2 size={20} className="animate-spin text-white/20" />
                          : s.value}
                      </p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent bookings preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Bookings</h3>
                    <button onClick={() => setNav('bookings')} className="text-xs text-[#FFD000]/70 hover:text-[#FFD000] transition-colors font-bold flex items-center gap-1">
                      View all <ChevronRight size={13} />
                    </button>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-[#FFD000]/30" /></div>
                  ) : bookings.length === 0 ? (
                    <div className={`${GLASS_SM} rounded-2xl py-12 text-center`}>
                      <BookOpen size={28} className="mx-auto text-white/10 mb-3" />
                      <p className="text-white/25 text-sm font-bold">No bookings yet</p>
                      <button onClick={() => setShowBulkBooking(true)} className="mt-4 text-xs font-black text-[#FFD000]/70 hover:text-[#FFD000] transition-colors">
                        Book your first mock exam →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookings.slice(0, 4).map(b => (
                        <div key={b.id} className={`${GLASS_SM} rounded-2xl px-5 py-4 flex items-center gap-4`}>
                          <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center shrink-0">
                            <BookOpen size={16} className="text-[#FFD000]/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">{b.exam_part || 'CMA Mock'}</p>
                            <p className="text-xs text-white/40">{b.preferred_date} · {b.student_count} students</p>
                          </div>
                          <StatusBadge value={b.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className={`${GLASS} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD000]/15 flex items-center justify-center"><Zap size={18} className="text-[#FFD000]" /></div>
                    <div>
                      <h3 className="font-black text-white text-sm">Quick Actions</h3>
                      <p className="text-white/30 text-xs">Manage your institute</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Book Mock Exam', desc: 'Register students for CMA mock', icon: Plus, action: () => setShowBulkBooking(true), gold: true },
                      { label: 'View Results', desc: 'Check published exam scores', icon: Trophy, action: () => setNav('results') },
                      { label: 'View Students', desc: 'Browse your student roster', icon: GraduationCap, action: () => setNav('students') },
                    ].map(a => (
                      <button key={a.label} onClick={a.action}
                        className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all ${a.gold
                          ? 'bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] shadow-[0_4px_20px_rgba(255,208,0,0.2)]'
                          : `${GLASS_SM} hover:bg-white/[0.08] text-white`}`}>
                        <a.icon size={16} />
                        <div>
                          <p className="font-black text-sm">{a.label}</p>
                          <p className={`text-xs mt-0.5 ${a.gold ? 'text-[#0a0a0a]/50' : 'text-white/40'}`}>{a.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {nav === 'bookings' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">Mock Exam Bookings</h2>
                    <p className="text-white/30 text-xs mt-1">{bookings.length} total bookings</p>
                  </div>
                  <button onClick={() => setShowBulkBooking(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-xs uppercase tracking-wider hover:bg-[#ffe44d] transition-all shadow-[0_0_16px_rgba(255,208,0,0.2)]">
                    <Plus size={13} /> New Booking
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#FFD000]/30" /></div>
                ) : bookings.length === 0 ? (
                  <div className={`${GLASS} rounded-3xl py-20 text-center`}>
                    <BookOpen size={40} className="mx-auto text-white/10 mb-4" />
                    <p className="text-white/30 font-bold text-sm uppercase tracking-wider mb-2">No bookings yet</p>
                    <p className="text-white/20 text-xs mb-6">Book a CMA mock exam for your students to get started</p>
                    <button onClick={() => setShowBulkBooking(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFD000] text-[#0a0a0a] font-black text-xs uppercase tracking-wider hover:bg-[#ffe44d] transition-all">
                      <Plus size={13} /> Book Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupByPeriod(bookings, b => b.preferred_date).map(([period, items]) => (
                      <div key={period}>
                        {/* Period divider */}
                        <div className="flex items-center gap-3 mb-2 mt-4 first:mt-0">
                          <span className="text-[10px] font-black text-[#FFD000]/50 uppercase tracking-[0.25em]">{period}</span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="text-[10px] text-white/20 font-bold">{items.length}</span>
                        </div>
                        {items.map(b => (
                          <div key={b.id} className={`${GLASS_SM} rounded-2xl overflow-hidden mb-2 hover:border-white/[0.14] transition-all`}>
                            <button onClick={() => toggleExpand(b.id)}
                              className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 text-left">
                              <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center shrink-0">
                                <Calendar size={15} className="text-[#FFD000]/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-white text-sm">{b.exam_part || 'CMA Mock'}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 font-bold">{b.student_count} student{b.student_count !== 1 ? 's' : ''}</span>
                                </div>
                                <p className="text-xs text-white/40 mt-0.5">{b.session_time} · {b.payment_method === 'pay_at_center' ? 'Pay at Center' : 'Online'}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <StatusBadge value={b.status} />
                                {expanded === b.id ? <ChevronUp size={15} className="text-white/30" /> : <ChevronDown size={15} className="text-white/30" />}
                              </div>
                            </button>
                            {expanded === b.id && (
                              <div className="px-5 pb-5 pt-1 border-t border-white/[0.06]">
                                <p className="text-[10px] font-black text-white/25 uppercase tracking-widest mb-3">Student Roster</p>
                                {loadingStudents[b.id] ? <Loader2 size={15} className="animate-spin text-white/20" /> :
                                  !studentMap[b.id]?.length ? <p className="text-white/20 text-xs">No students recorded.</p> : (
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {studentMap[b.id].map((s, i) => (
                                        <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${GLASS_SM} text-sm text-white/60`}>
                                          <span className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-black text-white/25 shrink-0">{i + 1}</span>
                                          {s.student_name}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── RESULTS ── */}
            {nav === 'results' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-white">Exam Results</h2>
                  <p className="text-white/30 text-xs mt-1">Published by FETS after exam evaluation</p>
                </div>

                {/* Stats row */}
                {results.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total', value: results.length, cls: 'text-white/70' },
                      { label: 'Passed', value: results.filter(r => r.result_status === 'pass').length, cls: 'text-emerald-400' },
                      { label: 'Failed', value: results.filter(r => r.result_status === 'fail').length, cls: 'text-red-400' },
                    ].map(s => (
                      <div key={s.label} className={`${GLASS_SM} rounded-2xl p-4`}>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-3xl font-black ${s.cls}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {results.length === 0 ? (
                  <div className={`${GLASS} rounded-3xl py-20 text-center`}>
                    <Trophy size={40} className="mx-auto text-white/10 mb-4" />
                    <p className="text-white/25 font-bold text-sm uppercase tracking-wider">No results yet</p>
                    <p className="text-white/15 text-xs mt-2 max-w-xs mx-auto leading-relaxed">Results will appear here once FETS publishes them for your students after each exam.</p>
                  </div>
                ) : (
                  <div className={`${GLASS_SM} rounded-2xl overflow-hidden`}>
                    <div className="hidden md:grid grid-cols-[2fr_1fr_1.2fr_0.8fr_1fr_1.2fr] gap-4 px-5 py-3 border-b border-white/[0.06]">
                      {['Student Name', 'Part', 'Exam Date', 'Score', 'Result', 'Published'].map(h => (
                        <span key={h} className="text-[10px] font-black text-white/25 uppercase tracking-widest">{h}</span>
                      ))}
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {results.map((r, i) => (
                        <div key={r.id} className={`grid grid-cols-2 md:grid-cols-[2fr_1fr_1.2fr_0.8fr_1fr_1.2fr] gap-4 px-5 py-4 items-center ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                          <span className="font-bold text-white text-sm truncate">{r.student_name}</span>
                          <span className="text-white/50 text-sm">{r.exam_part || '—'}</span>
                          <span className="text-white/40 text-sm">{r.exam_date ? new Date(r.exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</span>
                          <span className="text-white/70 text-sm font-black font-mono">{r.score != null ? r.score : '—'}</span>
                          <ResultBadge value={r.result_status} />
                          <span className="text-white/25 text-xs">{r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STUDENTS ── */}
            {nav === 'students' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">Student Roster</h2>
                    <p className="text-white/30 text-xs mt-1">Aggregated across all your bookings</p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className={`${GLASS} rounded-3xl py-20 text-center`}>
                    <GraduationCap size={40} className="mx-auto text-white/10 mb-4" />
                    <p className="text-white/25 font-bold text-sm uppercase tracking-wider">No students yet</p>
                    <p className="text-white/15 text-xs mt-2">Students will appear here after you create bookings</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => {
                      const students = studentMap[b.id];
                      const isLoaded = !!students;
                      const isExpanded = expanded === b.id;
                      return (
                        <div key={b.id} className={`${GLASS_SM} rounded-2xl overflow-hidden`}>
                          <button
                            onClick={async () => {
                              if (!studentMap[b.id]) {
                                setLoadingStudents(p => ({ ...p, [b.id]: true }));
                                const { data } = await supabase.from('cma_mock_students').select('student_name').eq('booking_id', b.id);
                                setStudentMap(p => ({ ...p, [b.id]: data || [] }));
                                setLoadingStudents(p => ({ ...p, [b.id]: false }));
                              }
                              setExpanded(isExpanded ? null : b.id);
                            }}
                            className="w-full flex items-center gap-4 px-5 py-4 text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <GraduationCap size={15} className="text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-white text-sm">{b.exam_part} · {b.preferred_date}</p>
                              <p className="text-xs text-white/30 mt-0.5">{b.student_count} student{b.student_count !== 1 ? 's' : ''} · {b.session_time}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <StatusBadge value={b.status} />
                              {loadingStudents[b.id] ? <Loader2 size={14} className="animate-spin text-white/20" /> : (
                                isExpanded ? <ChevronUp size={15} className="text-white/30" /> : <ChevronDown size={15} className="text-white/30" />
                              )}
                            </div>
                          </button>
                          {isExpanded && isLoaded && (
                            <div className="px-5 pb-5 border-t border-white/[0.05]">
                              {students.length === 0 ? (
                                <p className="text-white/20 text-xs py-3">No students recorded for this booking.</p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3">
                                  {students.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${GLASS_SM} text-sm`}>
                                      <div className="w-6 h-6 rounded-full bg-[#FFD000]/10 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-black text-[#FFD000]/60">{i + 1}</span>
                                      </div>
                                      <span className="text-white/70 truncate font-medium">{s.student_name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showBulkBooking && (
        <BulkBookingModal center={center} onClose={() => setShowBulkBooking(false)}
          onSuccess={() => { setShowBulkBooking(false); fetchData(); }} />
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InstituteDashboard({ onClose }) {
  const [view, setView] = useState('entry');
  const [center, setCenter] = useState(null);

  const handleAccessSuccess = (centerData) => { setCenter(centerData); setView('dashboard'); };

  const handleRegisterSuccess = async (code) => {
    const { data } = await supabase.from('coaching_centers').select('*')
      .eq('access_code', code).maybeSingle();
    if (data) { setCenter(data); setView('dashboard'); }
  };

  const handleSignOut = () => { setCenter(null); setView('entry'); if (onClose) onClose(); };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      {view !== 'dashboard' && onClose && (
        <button onClick={onClose}
          className="fixed top-4 right-4 z-[90] p-2.5 rounded-full bg-white/[0.07] border border-white/[0.10] backdrop-blur-xl text-white/40 hover:text-white hover:bg-white/[0.12] transition-all">
          <X size={18} />
        </button>
      )}
      {view === 'entry' && <EntryScreen onAccessSuccess={handleAccessSuccess} onRegister={() => setView('register')} />}
      {view === 'register' && <RegisterScreen onSuccess={handleRegisterSuccess} onBack={() => setView('entry')} />}
      {view === 'dashboard' && center && <DashboardScreen center={center} onSignOut={handleSignOut} />}
    </div>
  );
}
