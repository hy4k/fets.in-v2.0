import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp,
  Building2, LogOut, Users, BookOpen, Clock, Upload, Download,
  FileSpreadsheet, Plus, Trash2, ArrowRight, Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateAccessCode(instituteName = '') {
  const firstWord = instituteName.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${firstWord || 'FETS'}2026`;
}

function StatusBadge({ value }) {
  const map = {
    pending:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[value] || 'bg-white/5 text-white/40 border-white/10'}`}>
      {value || 'pending'}
    </span>
  );
}

function ResultBadge({ value }) {
  const map = {
    pass:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    fail:    'bg-red-500/15 text-red-400 border-red-500/20',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[value] || 'bg-white/5 text-white/40 border-white/10'}`}>
      {value || 'pending'}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent || 'bg-[#FFD000]/10 text-[#FFD000]'}`}>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-black text-white tracking-tight mb-1">
        {value === null || value === undefined ? <Loader2 size={22} className="animate-spin text-white/20" /> : value}
      </p>
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</p>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium';
const labelCls = 'block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest';

// ─── Entry Screen ─────────────────────────────────────────────────────────────

function EntryScreen({ onAccessSuccess, onRegister }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter an access code.'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: dbErr } = await supabase
        .from('coaching_centers').select('*')
        .eq('access_code', code.trim().toUpperCase()).eq('is_active', true).maybeSingle();
      if (dbErr) throw dbErr;
      if (!data) throw new Error('Invalid or inactive access code.');
      onAccessSuccess(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#FFD000]/[0.04] blur-[120px]" />
      </div>
      <div className="mb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="font-black text-[#FFD000] text-3xl tracking-tight">FETS</span>
          <span className="w-px h-8 bg-white/10" />
          <span className="text-white/40 font-bold text-sm tracking-widest uppercase">Institute Portal</span>
        </div>
        <p className="text-white/30 text-sm font-medium">Institute &amp; Coaching Centre Partner Dashboard</p>
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD000]/10 border border-[#FFD000]/20 flex items-center justify-center text-[#FFD000] mb-6">
            <Building2 size={22} />
          </div>
          <h2 className="text-white font-black text-xl mb-2 tracking-tight">I have an access code</h2>
          <p className="text-white/40 text-sm mb-7 leading-relaxed">Enter your institute's unique access code to view your dashboard and manage bookings.</p>
          <form onSubmit={handleAccess} className="space-y-4">
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. BRILLIANT2026"
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/20 transition-all font-mono font-black text-center tracking-[0.2em] text-lg uppercase shadow-inner"
              autoComplete="off" spellCheck={false}
            />
            {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Access Dashboard <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 mb-6">
            <span className="text-2xl font-black leading-none">+</span>
          </div>
          <h2 className="text-white font-black text-xl mb-2 tracking-tight">Register your institute</h2>
          <p className="text-white/40 text-sm mb-3 leading-relaxed">New to FETS? Get your institute access code and start managing your students' mock exams.</p>
          <p className="text-white/20 text-xs font-medium mb-7">Free to register &bull; No credit card required</p>
          <div className="mt-auto">
            <button onClick={onRegister}
              className="w-full py-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white font-black text-sm uppercase tracking-widest hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >Register Now &rarr;</button>
          </div>
        </div>
      </div>
      <p className="mt-12 text-white/20 text-xs text-center relative z-10">
        For support: <a href="mailto:mithun@fets.in" className="text-white/30 hover:text-white/60 transition-colors">mithun@fets.in</a>
      </p>
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
  const [description, setDescription] = useState('');
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
      </div>
      <div className="w-full max-w-lg relative z-10 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Registration Successful!</h1>
        <p className="text-white/50 mb-12 text-sm leading-relaxed">Save your access code — you'll need it every time you log in.</p>
        <div className="rounded-3xl border border-[#FFD000]/20 bg-[#FFD000]/[0.04] p-10 mb-6">
          <p className="text-[10px] font-black text-[#FFD000]/60 uppercase tracking-[0.3em] mb-4">Your Access Code</p>
          <p className="font-mono font-black text-[#FFD000] text-4xl tracking-[0.3em] mb-2">{generatedCode}</p>
          <p className="text-white/30 text-xs mt-3">Keep this code safe — it's your institute's login key</p>
        </div>
        <div className="space-y-3">
          <button onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-bold text-sm hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
          >
            {copied ? <><CheckCircle2 size={16} className="text-emerald-400" /> Copied!</> : <><Copy size={16} /> Copy Access Code</>}
          </button>
          <button onClick={() => onSuccess(generatedCode)}
            className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
          >Access Your Dashboard &rarr;</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#FFD000]/[0.03] blur-[120px]" />
      </div>
      <div className="w-full max-w-lg relative z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-10">
          &larr; Back
        </button>
        <div className="mb-10">
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000] text-[10px] font-black uppercase tracking-widest mb-4">
            New Institute Registration
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Register Your Institute</h1>
          <p className="text-white/40 text-sm leading-relaxed">Join the FETS partner network to manage your students' CMA mock exams.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Institute Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ABC Commerce Academy" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Person Name *</label>
            <input type="text" required value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Your full name" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="institute@email.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
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
          <div>
            <label className={labelCls}>Description <span className="text-white/20">(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of your institute..." rows={3}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
          >
            {loading ? <Loader2 size={16} className="animate-spin text-[#0a0a0a]" /> : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Bulk Booking Modal ───────────────────────────────────────────────────────

function BulkBookingModal({ center, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1=details 2=roster 3=success
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
      ['Jane Smith', 'Part 2', 'jane@email.com', '9876543211'],
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
      const data = rows.slice(1).filter(r => r[0]);
      setParsedStudents(data);
    };
    reader.readAsBinaryString(file);
  };

  const addStudent = () => setStudents(s => [...s, '']);
  const removeStudent = (i) => setStudents(s => s.filter((_, idx) => idx !== i));
  const updateStudent = (i, v) => setStudents(s => s.map((x, idx) => idx === i ? v : x));

  const handleSubmit = async () => {
    const finalStudents = rosterMethod === 'excel'
      ? parsedStudents.map(r => String(r[0] || '').trim()).filter(Boolean)
      : students.map(s => s.trim()).filter(Boolean);
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
        status: 'pending',
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

  const finalCount = rosterMethod === 'excel'
    ? parsedStudents.filter(r => r[0]).length
    : students.filter(s => s.trim()).length;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#0f0f0f] flex flex-col max-h-[92vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Bulk Mock Booking</h2>
            <p className="text-xs text-white/40 mt-0.5">{center.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Step indicators */}
            <div className="hidden sm:flex items-center gap-2">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= s ? 'bg-[#FFD000] text-[#0a0a0a]' : 'bg-white/10 text-white/30'} ${step === 3 && 'bg-emerald-500 text-white'}`}>
                    {step === 3 ? '✓' : s}
                  </div>
                  {s < 2 && <div className={`w-6 h-px ${step > s ? 'bg-[#FFD000]' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"><X size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-7">
          {/* Step 1: Exam details */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Step 1 — Exam Details</p>
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
              <button onClick={() => { if (!preferredDate) { setError('Please select a date.'); return; } setError(''); setStep(2); }}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all mt-2 flex items-center justify-center gap-2"
              >Next: Add Students <ArrowRight size={16} /></button>
              {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            </div>
          )}

          {/* Step 2: Student roster */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">&larr; Back</button>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Step 2 — Student Roster</p>
              </div>

              {/* Toggle */}
              <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                {['manual', 'excel'].map(m => (
                  <button key={m} onClick={() => setRosterMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${rosterMethod === m ? 'bg-[#FFD000] text-[#0a0a0a] shadow-md' : 'text-white/40 hover:text-white'}`}
                  >
                    {m === 'manual' ? '✏ Manual Entry' : '📊 Excel Upload'}
                  </button>
                ))}
              </div>

              {rosterMethod === 'manual' ? (
                <div className="space-y-3">
                  {students.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="shrink-0 w-6 text-xs font-black text-white/20 text-right">{i + 1}</span>
                      <input type="text" value={s} onChange={e => updateStudent(i, e.target.value)}
                        placeholder={`Student ${i + 1} full name`}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm"
                      />
                      {students.length > 1 && (
                        <button onClick={() => removeStudent(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={addStudent}
                    className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#FFD000] transition-colors mt-1"
                  ><Plus size={14} /> Add Student</button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] border-dashed">
                    <div className="flex items-start gap-4 mb-4">
                      <FileSpreadsheet size={28} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-bold text-sm mb-1">Excel Template Format</p>
                        <p className="text-white/40 text-xs leading-relaxed">Column A: Student Name · Column B: CMA Part · Column C: Email · Column D: Phone</p>
                      </div>
                    </div>
                    <button onClick={downloadTemplate}
                      className="flex items-center gap-2 text-xs font-black text-[#FFD000] hover:text-[#ffe44d] transition-colors uppercase tracking-widest"
                    ><Download size={13} /> Download Template</button>
                  </div>
                  <label className="block w-full p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] border-dashed text-center cursor-pointer hover:border-[#FFD000]/30 hover:bg-[#FFD000]/[0.02] transition-all">
                    <Upload size={22} className="mx-auto text-white/30 mb-2" />
                    <p className="text-white/60 text-sm font-bold mb-0.5">Click to upload Excel file</p>
                    <p className="text-white/25 text-xs">.xlsx or .xls</p>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
                  </label>
                  {parsedStudents.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
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
              <button onClick={handleSubmit} disabled={loading || !finalCount}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : `Confirm Booking (${finalCount} Students)`}
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-6">
                <CheckCircle2 size={38} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Booking Confirmed!</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                Your bulk booking for <strong className="text-white">{finalCount} students</strong> has been submitted. FETS will confirm the session shortly.
              </p>
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-6 text-left space-y-2">
                {[['Exam Part', examPart], ['Date', preferredDate], ['Session', sessionTime], ['Payment', paymentMethod === 'pay_at_center' ? 'Pay at Center' : 'Online Transfer']].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-white/40 font-medium">{k}</span>
                    <span className="text-white font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={onSuccess}
                className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all"
              >Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Upload Modal ─────────────────────────────────────────────────────

function ResultsUploadModal({ center, bookings, onClose, onSuccess }) {
  const [parsedData, setParsedData] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Student Name', 'CMA Part', 'Exam Date (DD-MM-YYYY)', 'Score', 'Result (Pass/Fail)'],
      ['John Doe', 'Part 1', '15-04-2026', '72', 'Pass'],
      ['Jane Smith', 'Part 2', '15-04-2026', '65', 'Fail'],
    ]);
    ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 22 }, { wch: 8 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, 'FETS_Results_Upload_Template.xlsx');
  };

  const parseDate = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    // DD-MM-YYYY or DD/MM/YYYY
    const m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    // Excel serial number
    if (/^\d+$/.test(s)) {
      const d = new Date(Math.round((parseInt(s) - 25569) * 86400 * 1000));
      return d.toISOString().split('T')[0];
    }
    return null;
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const data = rows.slice(1).filter(r => r[0]).map(r => ({
        student_name: String(r[0] || '').trim(),
        exam_part: String(r[1] || '').trim() || null,
        exam_date: parseDate(r[2]),
        score: r[3] !== undefined && r[3] !== '' ? parseFloat(r[3]) : null,
        result_status: String(r[4] || '').toLowerCase().includes('pass') ? 'pass'
          : String(r[4] || '').toLowerCase().includes('fail') ? 'fail' : 'pending',
      }));
      setParsedData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!parsedData.length) { setError('No data to upload.'); return; }
    setLoading(true); setError('');
    try {
      const rows = parsedData.map(r => ({
        coaching_center_id: center.id,
        booking_id: selectedBookingId || null,
        student_name: r.student_name,
        exam_part: r.exam_part,
        exam_date: r.exam_date,
        score: r.score,
        result_status: r.result_status,
      }));
      const { error: upErr } = await supabase.from('exam_results').insert(rows);
      if (upErr) throw upErr;
      onSuccess();
    } catch (err) { setError(err.message || 'Upload failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-[#0f0f0f] flex flex-col max-h-[92vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Upload Exam Results</h2>
            <p className="text-xs text-white/40 mt-0.5">{parsedData.length > 0 ? `${parsedData.length} records ready to upload` : 'Upload an Excel file with results'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-7 space-y-6">
          {/* Template */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/10">
            <div className="flex items-start gap-4 mb-3">
              <FileSpreadsheet size={26} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm mb-1">Excel File Format</p>
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {['Student Name', 'CMA Part', 'Exam Date', 'Score', 'Result'].map(h => (
                    <span key={h} className="text-center text-[9px] font-black text-white/30 uppercase tracking-wider bg-white/[0.04] rounded px-1 py-1.5">{h}</span>
                  ))}
                </div>
                <p className="text-white/25 text-[10px] mt-2">Date format: DD-MM-YYYY · Result: Pass or Fail</p>
              </div>
            </div>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
            ><Download size={13} /> Download Template</button>
          </div>

          {/* File upload */}
          <label className="block w-full p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] border-dashed text-center cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all">
            <Upload size={26} className="mx-auto text-white/30 mb-3" />
            <p className="text-white/60 text-sm font-bold mb-1">Click to upload results file</p>
            <p className="text-white/25 text-xs">.xlsx or .xls — max 500 rows</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
          </label>

          {/* Preview */}
          {parsedData.length > 0 && (
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Preview ({parsedData.length} records)</p>
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_0.7fr_1fr] gap-3 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
                  {['Name', 'Part', 'Date', 'Score', 'Result'].map(h => (
                    <span key={h} className="text-[9px] font-black text-white/30 uppercase tracking-wider">{h}</span>
                  ))}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {parsedData.map((r, i) => (
                    <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_0.7fr_1fr] gap-3 px-4 py-2.5 items-center ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <span className="text-white/80 text-xs font-semibold truncate">{r.student_name}</span>
                      <span className="text-white/50 text-xs">{r.exam_part || '—'}</span>
                      <span className="text-white/40 text-xs">{r.exam_date || '—'}</span>
                      <span className="text-white/60 text-xs font-bold">{r.score ?? '—'}</span>
                      <ResultBadge value={r.result_status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Link to booking (optional) */}
          {bookings.length > 0 && (
            <div>
              <label className={labelCls}>Link to Booking <span className="text-white/20">(optional)</span></label>
              <select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="">— Select a booking —</option>
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.exam_part} · {b.preferred_date} · {b.student_count} students
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <button onClick={handleUpload} disabled={loading || !parsedData.length}
            className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : `Upload ${parsedData.length} Results`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function DashboardScreen({ center, onSignOut }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: null, students: null, pending: null });
  const [expanded, setExpanded] = useState(null);
  const [studentMap, setStudentMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState({});
  const [results, setResults] = useState([]);
  const [showBulkBooking, setShowBulkBooking] = useState(false);
  const [showResultsUpload, setShowResultsUpload] = useState(false);

  const fetchData = useCallback(async () => {
    if (!center?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('cma_mock_bookings').select('*')
        .eq('coaching_center_id', center.id).order('created_at', { ascending: false });
      const rows = data || [];
      setBookings(rows);
      setStats({
        total: rows.length,
        students: rows.reduce((s, r) => s + (r.student_count || 0), 0),
        pending: rows.filter(r => (r.status || 'pending') === 'pending').length,
      });
    } finally { setLoading(false); }
  }, [center?.id]);

  const fetchResults = useCallback(async () => {
    if (!center?.id) return;
    const { data } = await supabase.from('exam_results').select('*')
      .eq('coaching_center_id', center.id).order('uploaded_at', { ascending: false });
    setResults(data || []);
  }, [center?.id]);

  useEffect(() => { fetchData(); fetchResults(); }, [fetchData, fetchResults]);

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (studentMap[id]) return;
    setLoadingStudents(p => ({ ...p, [id]: true }));
    const { data } = await supabase.from('cma_mock_students').select('student_name').eq('booking_id', id);
    setStudentMap(p => ({ ...p, [id]: data || [] }));
    setLoadingStudents(p => ({ ...p, [id]: false }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-[#FFD000]/[0.03] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#FFD000] text-xl tracking-tight">FETS</span>
              <span className="w-px h-5 bg-white/10" />
              <span className="text-white/30 font-bold text-xs uppercase tracking-widest">Institute Portal</span>
            </div>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/[0.06]">
              <Building2 size={14} className="text-white/40" />
              <span className="text-white font-bold text-sm">{center.name}</span>
              {center.city && <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-bold uppercase tracking-wider">{center.city}</span>}
            </div>
          </div>
          <button onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all text-xs font-bold uppercase tracking-wider"
          ><LogOut size={13} /> Sign Out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-white/40 text-sm font-medium">Your CMA Mock Exam bookings, students and results</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-10 flex-col sm:flex-row">
          <StatCard label="Total Bookings" value={stats.total} icon={BookOpen} accent="bg-[#FFD000]/10 text-[#FFD000]" />
          <StatCard label="Total Students" value={stats.students} icon={Users} accent="bg-blue-500/10 text-blue-400" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} accent="bg-amber-500/10 text-amber-400" />
          <StatCard label="Results Uploaded" value={results.length} icon={Trophy} accent="bg-emerald-500/10 text-emerald-400" />
        </div>

        {/* Bookings */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight">Mock Exam Bookings</h2>
          <button onClick={() => { fetchData(); fetchResults(); }} className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider">Refresh</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={30} className="animate-spin text-[#FFD000]/40" /></div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
            <BookOpen size={36} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 font-bold text-sm uppercase tracking-wider">No bookings yet</p>
            <p className="text-white/20 text-xs mt-2">Use the button below to book a mock exam for your students</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_1fr_0.6fr_1fr_40px] gap-4 px-5 py-2">
              {['Date Submitted', 'Exam Part', 'Preferred Date', 'Session', 'Students', 'Status', ''].map(h => (
                <span key={h} className="text-[10px] font-black text-white/30 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {bookings.map(b => (
              <div key={b.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.1] transition-colors">
                <button onClick={() => toggleExpand(b.id)}
                  className="w-full grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_0.6fr_1fr_40px] gap-4 items-center px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white/70">{b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</span>
                  <span className="text-sm font-bold text-white">{b.exam_part || '—'}</span>
                  <span className="text-sm text-white/60 font-medium">{b.preferred_date || '—'}</span>
                  <span className="text-xs text-white/50 font-medium">{b.session_time || '—'}</span>
                  <span className="text-sm font-bold text-white text-center">{b.student_count || 1}</span>
                  <StatusBadge value={b.status} />
                  <div className="flex items-center justify-end">
                    {expanded === b.id ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                  </div>
                </button>
                {expanded === b.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/[0.04]">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Student Roster</p>
                    {loadingStudents[b.id] ? <Loader2 size={16} className="animate-spin text-white/20" /> :
                      (studentMap[b.id]?.length || 0) === 0 ? <p className="text-white/20 text-xs font-medium">No students recorded.</p> : (
                        <ol className="space-y-1.5">
                          {studentMap[b.id].map((s, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                              <span className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-black text-white/30">{i + 1}</span>
                              {s.student_name}
                            </li>
                          ))}
                        </ol>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results section */}
        {results.length > 0 && (
          <div className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white tracking-tight">Exam Results</h2>
              <span className="text-xs text-white/30 font-bold">{results.length} records</span>
            </div>
            <div className="rounded-3xl border border-white/[0.06] overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.8fr_1fr] gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                {['Student Name', 'Exam Part', 'Exam Date', 'Score', 'Result'].map(h => (
                  <span key={h} className="text-[10px] font-black text-white/30 uppercase tracking-widest">{h}</span>
                ))}
              </div>
              {results.map((r, i) => (
                <div key={r.id} className={`grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_0.8fr_1fr] gap-4 px-5 py-3.5 items-center ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <span className="font-semibold text-white text-sm">{r.student_name}</span>
                  <span className="text-white/60 text-sm">{r.exam_part || '—'}</span>
                  <span className="text-white/50 text-sm">{r.exam_date ? new Date(r.exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</span>
                  <span className="text-white/70 text-sm font-bold">{r.score != null ? r.score : '—'}</span>
                  <ResultBadge value={r.result_status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-[#FFD000]/10 bg-[#FFD000]/[0.03] p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000]"><Users size={22} /></div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 tracking-tight">Bulk Mock Booking</h3>
              <p className="text-white/40 text-sm leading-relaxed">Book a CMA mock exam for multiple students. Upload an Excel roster or enter names manually.</p>
            </div>
            <button onClick={() => setShowBulkBooking(true)}
              className="mt-auto px-6 py-3.5 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
            >Book for Students →</button>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Upload size={22} /></div>
            <div>
              <h3 className="text-xl font-black text-white mb-1 tracking-tight">Upload Results</h3>
              <p className="text-white/40 text-sm leading-relaxed">Upload your students' exam results. They'll appear here and in the FETS admin dashboard.</p>
            </div>
            <button onClick={() => setShowResultsUpload(true)}
              className="mt-auto px-6 py-3.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] text-white font-black text-sm uppercase tracking-widest hover:bg-white/[0.08] transition-all"
            >Upload Results →</button>
          </div>
        </div>
      </main>

      {showBulkBooking && (
        <BulkBookingModal center={center} onClose={() => setShowBulkBooking(false)}
          onSuccess={() => { setShowBulkBooking(false); fetchData(); }} />
      )}
      {showResultsUpload && (
        <ResultsUploadModal center={center} bookings={bookings}
          onClose={() => setShowResultsUpload(false)}
          onSuccess={() => { setShowResultsUpload(false); fetchResults(); }} />
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
          className="fixed top-4 right-4 z-[90] p-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
        ><X size={18} /></button>
      )}
      {view === 'entry' && <EntryScreen onAccessSuccess={handleAccessSuccess} onRegister={() => setView('register')} />}
      {view === 'register' && <RegisterScreen onSuccess={handleRegisterSuccess} onBack={() => setView('entry')} />}
      {view === 'dashboard' && center && <DashboardScreen center={center} onSignOut={handleSignOut} />}
    </div>
  );
}
