import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp, ChevronRight,
  Building2, LogOut, Users, BookOpen, Clock, Upload, Download,
  FileSpreadsheet, Plus, Trash2, ArrowRight, Trophy,
  LayoutDashboard, GraduationCap, TrendingUp, Menu, BarChart3,
  Calendar, Bell, Award, Target, Zap, FileText, Share2, Layers, Briefcase, BarChart2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Constants & Styles ────────────────────────────────────────────────────────

const GLASS = 'bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.03)]';
const GLASS_SM = 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]';
const inputCls = 'w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/15 transition-all text-sm font-medium';
const labelCls = 'block text-[10px] font-black text-white/30 mb-2 uppercase tracking-[0.2em]';

function generateAccessCode(instituteName = '') {
  const firstWord = instituteName.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${firstWord || 'INST'}2026`;
}

// ─── Shared Components ─────────────────────────────────────────────────────────

function StatusBadge({ value }) {
  const map = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[value] || 'bg-white/5 text-white/40 border-white/10'}`}>
      {value || 'pending'}
    </span>
  );
}

function BgBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-[#FFD000]/[0.05] blur-[150px]" />
      <div className="absolute top-[20%] -right-60 w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[130px]" />
      <div className="absolute -bottom-40 left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
      <div className="absolute top-[60%] left-[50%] w-[400px] h-[400px] rounded-full bg-teal-500/[0.02] blur-[100px]" />
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

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
  const fetchData = () => {}; // defined but placeholder for file logic

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const rows = data.slice(1).filter(r => r[0]); // Skip header
        setParsedStudents(rows);
        if (rows.length === 0) setError('No student data found in file.');
      } catch (err) { setError('Failed to parse Excel file.'); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    const finalNames = rosterMethod === 'manual' 
      ? students.filter(s => s.trim()) 
      : parsedStudents.map(r => r[0]);

    if (!finalNames.length) { setError('Add at least one student.'); return; }
    setLoading(true); setError('');
    
    try {
      // 1. Create Booking
      const { data: booking, error: bErr } = await supabase.from('cma_mock_bookings').insert({
        coaching_center_id: center.id,
        exam_part: examPart,
        student_count: finalNames.length,
        preferred_date: preferredDate,
        status: 'pending',
        payment_status: paymentMethod === 'pay_at_center' ? 'unpaid' : 'pending'
      }).select().single();

      if (bErr) throw bErr;

      // 2. Create Students
      const studentRows = finalNames.map(name => ({
        booking_id: booking.id,
        coaching_center_id: center.id,
        student_name: name,
        payment_status: 'pending'
      }));

      const { error: sErr } = await supabase.from('cma_mock_students').insert(studentRows);
      if (sErr) throw sErr;

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`${GLASS} w-full max-w-2xl rounded-[2.5rem] overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-300`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors z-10"><X size={20} /></button>
        
        <div className="p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">New Bulk Booking</h3>
                <p className="text-white/40 text-sm font-medium">Configure your institute's exam session.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className={labelCls}>CMA Exam Part</label>
                   <select value={examPart} onChange={e => setExamPart(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                      <option>Part 1</option>
                      <option>Part 2</option>
                   </select>
                </div>
                <div>
                   <label className={labelCls}>Preferred Date</label>
                   <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className={labelCls}>Preferred Session</label>
                   <select value={sessionTime} onChange={e => setSessionTime(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                      <option>Morning (9:00 AM)</option>
                      <option>Noon (1:00 PM)</option>
                      <option>Afternoon (3:00 PM)</option>
                   </select>
                </div>
                <div>
                   <label className={labelCls}>Payment Choice</label>
                   <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                      <option value="pay_at_center">Pay at Center</option>
                      <option value="online">Online Transfer</option>
                   </select>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full h-16 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_12px_32px_rgba(255,208,0,0.2)]">
                Next: Add Candidates <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Candidate Roster</h3>
                    <p className="text-white/40 text-sm font-medium">Add students for this booking.</p>
                 </div>
                 <button onClick={() => setStep(1)} className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">← Back</button>
              </div>

              <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
                 {['manual', 'excel'].map(m => (
                    <button key={m} onClick={() => setRosterMethod(m)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rosterMethod === m ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}>
                       {m === 'manual' ? 'Manual Entry' : 'Excel Import'}
                    </button>
                 ))}
              </div>

              {rosterMethod === 'manual' ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {students.map((s, i) => (
                     <div key={i} className="flex gap-3">
                        <input type="text" value={s} onChange={e => {
                          const n = [...students]; n[i] = e.target.value; setStudents(n);
                        }} placeholder={`Student ${i+1} Name`} className={inputCls} />
                        {students.length > 1 && (
                          <button onClick={() => setStudents(students.filter((_, idx)=>idx!==i))} className="p-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"><Trash2 size={18} /></button>
                        )}
                     </div>
                   ))}
                   <button onClick={() => setStudents([...students, ''])} className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest">
                      + Add Another Student
                   </button>
                </div>
              ) : (
                <label className="block p-12 rounded-[2rem] bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-[#FFD000]/40 transition-all text-center cursor-pointer">
                   <Upload size={32} className="mx-auto text-white/20 mb-4" />
                   <p className="text-white font-bold text-sm mb-1">Click to Upload Roster</p>
                   <p className="text-white/20 text-xs uppercase tracking-widest font-black">.xlsx Format Only</p>
                   <input type="file" className="hidden" accept=".xlsx" onChange={handleFile} />
                   {parsedStudents.length > 0 && <p className="mt-4 text-emerald-400 text-xs font-black uppercase tracking-widest">✓ {parsedStudents.length} Students Detected</p>}
                </label>
              )}

              {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}

              <button onClick={handleSubmit} disabled={loading} className="w-full h-16 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_12px_32px_rgba(255,208,0,0.2)]">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Final Booking'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10">
               <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={40} />
               </div>
               <h3 className="text-4xl font-black text-white mb-4 tracking-tight">Booking Sent!</h3>
               <p className="text-white/40 text-sm font-medium mb-12 max-w-sm mx-auto leading-relaxed">Verification is in progress. Our support team will confirm your session shortly.</p>
               <button onClick={onSuccess} className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">Back to Overview</button>
            </div>
          )}
        </div>
      </div>
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
    if (!code.trim()) { setError('Enter your access code.'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: dbErr } = await supabase
        .from('coaching_centers').select('*')
        .eq('access_code', code.trim().toUpperCase()).eq('is_active', true).maybeSingle();
      if (dbErr) throw dbErr;
      if (!data) throw new Error('Code not found. Please register or check with admin.');
      onAccessSuccess(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#07070f] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <BgBlobs />
      
      <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-8 md:px-12 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/40">
             <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-white font-black text-sm uppercase tracking-[0.3em]">Institute Portal</h1>
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Access & Registration</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => window.location.href = '/'} className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Back to Website</button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mt-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          <div className={`${GLASS} rounded-[2rem] p-10 lg:p-14 relative overflow-hidden group flex flex-col justify-between`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFD000]/10 blur-[60px] group-hover:bg-[#FFD000]/15 transition-all duration-700" />
              <div>
                <h3 className="text-[#FFD000] font-black text-xs uppercase tracking-[0.3em] mb-4">Identity Access</h3>
                <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Access Dashboard</h2>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-10 max-w-sm">Enter your institute's permanent access code to manage bookings and view results.</p>
              </div>

              <form onSubmit={handleAccess} className="space-y-4">
                <input
                  type="text" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="w-full h-16 rounded-2xl bg-white/[0.04] border border-white/10 text-center text-xl font-black tracking-[0.3em] text-[#FFD000] focus:outline-none focus:border-[#FFD000]/40 transition-all placeholder:text-white/5 placeholder:tracking-normal placeholder:font-bold placeholder:text-sm"
                />
                {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full h-14 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_12px_40px_rgba(255,208,0,0.2)] disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In Now'}
                </button>
              </form>
          </div>

          <div className={`${GLASS} rounded-[2rem] p-10 lg:p-14 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.04] transition-all border-dashed border-white/10`} onClick={onRegister}>
             <div>
                <h3 className="text-white/30 font-black text-xs uppercase tracking-[0.3em] mb-4">Onboarding</h3>
                <h2 className="text-3xl font-black text-white mb-6 tracking-tight">New Institute</h2>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-6 max-w-sm">Register your coaching center to receive your unique access code and start booking mock exams immediately.</p>
                <div className="flex flex-wrap gap-2 mb-10">
                   {['Bulk Booking', 'Reports', 'Result Export'].map(f => (
                     <span key={f} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] text-white/20 font-black uppercase tracking-widest">{f}</span>
                   ))}
                </div>
             </div>
             <button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest group-hover:bg-white/10 transition-all flex items-center justify-center gap-3">
               Start Registration <ArrowRight size={18} />
             </button>
          </div>
        </div>
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
    if (!name || !contactPerson || !email || !phone) { setError('Fill all required fields.'); return; }
    setLoading(true); setError('');
    const code = generateAccessCode(name);
    try {
      const { error: dbErr } = await supabase.from('coaching_centers').insert({
        name, contact: phone, email, city, contact_name: contactPerson,
        access_code: code, is_active: true,
      });
      if (dbErr) throw dbErr;
      setGeneratedCode(code); setSuccess(true);
    } catch (err) { setError(err.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center p-6 relative overflow-hidden">
      <BgBlobs />
      <div className={`relative z-10 w-full max-w-md ${GLASS} rounded-[2.5rem] p-12 text-center shadow-2xl`}>
         <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={40} />
         </div>
         <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Success!</h2>
         <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed">Your institute is registered. Save this code to access your portal always.</p>
         
         <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 relative group cursor-pointer active:scale-95 transition-all" onClick={() => { navigator.clipboard.writeText(generatedCode); setCopied(true); setTimeout(()=>setCopied(false),2000); }}>
            <p className="text-[10px] font-black text-[#FFD000]/60 uppercase tracking-[0.3em] mb-3">Your Access Code</p>
            <p className="text-4xl font-black text-white tracking-[0.2em]">{generatedCode}</p>
            <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
               {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </div>
         </div>

         <button onClick={() => onSuccess(generatedCode)} 
            className="w-full h-14 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_12px_32px_rgba(255,208,0,0.2)]"
         >Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center p-6 relative overflow-hidden">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-xl">
        <button onClick={onBack} className="mb-10 flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
           <ArrowRight size={14} className="rotate-180" /> Back
        </button>
        <div className={`${GLASS} rounded-[2.5rem] p-10 shadow-2xl overflow-hidden`}>
           <div className="mb-10">
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Onboarding</h2>
              <p className="text-white/40 text-sm font-medium">Join our network of educational partners.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label className={labelCls}>Institute Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Brain Academy" className={inputCls} required />
                 </div>
                 <div>
                    <label className={labelCls}>Contact Name</label>
                    <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Person name" className={inputCls} required />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="office@inst.com" className={inputCls} required />
                 </div>
                 <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" className={inputCls} required />
                 </div>
              </div>
              <div>
                 <label className={labelCls}>City</label>
                 <select value={city} onChange={e => setCity(e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }}>
                    <option value="Calicut">Calicut</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Other">Other Locations</option>
                 </select>
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center mt-4">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mt-4">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Setup'}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Views ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: StatIcon, color, suffix }) {
  return (
    <div className={`${GLASS} rounded-3xl p-6 relative overflow-hidden group`}>
       <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40`} style={{ background: color }} />
       <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', color }}>
                <StatIcon size={18} />
             </div>
             <h4 className="text-white/30 text-[10px] font-black uppercase tracking-widest">{label}</h4>
          </div>
          <div className="flex items-end gap-1">
             <span className="text-3xl font-black text-white tracking-tight leading-none">{value}</span>
             {suffix && <span className="text-[10px] font-black text-white/20 uppercase mb-1 tracking-widest">{suffix}</span>}
          </div>
       </div>
    </div>
  );
}

function OverviewView({ stats, bookings, results }) {
  const recentBookings = bookings.slice(0, 3);
  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Bookings Feed" value={stats.total} icon={Briefcase} color="#FFD000" />
          <StatCard label="Total Candidates" value={stats.students} icon={Users} color="#3b82f6" />
          <StatCard label="Live Requests" value={stats.pending} icon={Clock} color="#f59e0b" />
          <StatCard label="Avg. Score Rank" value={stats.performance} icon={Trophy} color="#10b981" suffix="%" />
       </div>
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="space-y-4">
             <h3 className="text-white font-black text-xs uppercase tracking-widest px-2">Recent Bookings</h3>
             <div className="space-y-3">
                {recentBookings.map(b => (
                  <div key={b.id} className={`${GLASS_SM} rounded-2xl p-5 flex items-center justify-between group hover:bg-white/[0.08] transition-all`}>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center text-white/20 text-[9px] font-black group-hover:text-white/40 transition-colors">
                           <span className="uppercase">{new Date(b.created_at).toLocaleString('default', { month: 'short' })}</span>
                           <span className="text-sm -mt-1">{new Date(b.created_at).getDate()}</span>
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm leading-none mb-1">{b.exam_part}</p>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{b.student_count} Candidates</p>
                        </div>
                     </div>
                     <StatusBadge value={b.status} />
                  </div>
                ))}
                {recentBookings.length === 0 && <div className="p-8 rounded-3xl border border-dashed border-white/5 text-center text-white/20 text-[10px] font-black uppercase">No bookings yet</div>}
             </div>
          </section>
          <section className={`${GLASS} rounded-[2rem] p-8 flex flex-col justify-center items-center text-center overflow-hidden relative`}>
             <div className="w-16 h-16 rounded-2xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] mb-6 animate-bounce">
                <TrendingUp size={28} />
             </div>
             <h3 className="text-white font-black text-lg mb-2 tracking-tight">Institute Performance</h3>
             <p className="text-white/30 text-xs font-medium max-w-xs mb-8 leading-relaxed">Your portal ranking is healthy. Ensure timely student information updates.</p>
             <div className="flex items-center gap-8 w-full max-w-sm">
                <div className="flex-1 space-y-2 text-left">
                   <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                      <span>Efficiency Index</span>
                      <span className="text-white">{stats.performance}%</span>
                   </div>
                   <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-[#FFD000] rounded-full" style={{ width: `${stats.performance}%` }} />
                   </div>
                </div>
             </div>
          </section>
       </div>
    </div>
  );
}

function BookingsView({ bookings }) {
   return (
     <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className={`${GLASS} rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all`}>
             <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex flex-col items-center justify-center text-white/20 text-[11px] font-black border border-white/5">
                   <span className="uppercase">{new Date(b.created_at).toLocaleString('default', { month: 'long' })}</span>
                   <span className="text-xl -mt-1">{new Date(b.created_at).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h4 className="text-white font-black text-lg tracking-tight">{b.exam_part}</h4>
                     <StatusBadge value={b.status} />
                  </div>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest italic">{b.student_count} Candidates • ID: {b.id.slice(0, 8)}</p>
                </div>
             </div>
             <button className="h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all">View Details</button>
          </div>
        ))}
        {bookings.length === 0 && <div className="p-20 text-center text-white/20 text-[11px] font-black uppercase tracking-widest">No booking entries found</div>}
     </div>
   );
}

function RosterView({ students }) {
   return (
     <div className={`${GLASS} rounded-[2rem] overflow-hidden`}>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white/[0.03] border-b border-white/5">
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Candidate</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Exam Info</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Booking Ref</th>
                    <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                 {students.map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="p-6">
                          <p className="text-white font-bold text-sm">{s.student_name}</p>
                          <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">ID: {s.id.slice(0, 8)}</p>
                       </td>
                       <td className="p-6">
                          <p className="text-white/60 text-[11px] font-black uppercase tracking-widest leading-none mb-1">{s.cma_mock_bookings?.exam_part || 'TBD'}</p>
                          <p className="text-white/20 text-[10px] font-medium">{new Date(s.cma_mock_bookings?.preferred_date).toLocaleDateString() || 'Pending'}</p>
                       </td>
                       <td className="p-6 font-mono text-white/20 text-xs tracking-tighter">#{s.booking_id.slice(0, 6)}</td>
                       <td className="p-6 text-right"><button className="text-white/10 hover:text-[#FFD000] focus:outline-none"><ChevronRight size={18} /></button></td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
        {students.length === 0 && <div className="p-20 text-center text-white/20 text-[11px] font-black uppercase tracking-widest">Roster is empty</div>}
     </div>
   );
}

function ResultsView({ results }) {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {results.map(r => (
           <div key={r.id} className={`${GLASS} rounded-3xl p-6 group`}>
              <div className="flex items-center justify-between mb-8">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><GraduationCap size={20} /></div>
                 <span className={`px-2 py-1 rounded-lg border ${r.result_status === 'pass' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-[9px] font-black uppercase tracking-widest`}>{r.result_status}</span>
              </div>
              <h4 className="text-white font-black text-xl mb-1 tracking-tight truncate">{r.student_name}</h4>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-6 italic">{r.exam_part}</p>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{r.total_score || '0'}</span>
                    <span className="text-[9px] font-black text-white/20 uppercase">Units</span>
                 </div>
                 <button className="p-3 rounded-xl bg-white/5 hover:bg-[#FFD000] hover:text-[#0a0a0a] transition-all text-white/30"><Download size={14} /></button>
              </div>
           </div>
        ))}
        {results.length === 0 && <div className="col-span-full p-20 text-center text-white/20 text-[11px] font-black uppercase tracking-widest">No results archived yet</div>}
     </div>
   );
}

function ReportsView({ center, students, results }) {
   const handleExport = (type) => {
      const data = type === 'roster' ? students.map(s => ({ Name: s.student_name, Exam: s.cma_mock_bookings?.exam_part, Date: s.cma_mock_bookings?.preferred_date })) : results.map(r => ({ Name: r.student_name, Score: r.total_score, Status: r.result_status }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Export");
      XLSX.writeFile(wb, `${center.name}_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
   };
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`${GLASS} rounded-[2.5rem] p-10 flex flex-col justify-between group`}>
           <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FFD000]/10 text-[#FFD000] border border-[#FFD000]/20 flex items-center justify-center mb-10 group-hover:bg-[#FFD000] group-hover:text-black transition-all duration-500"><BarChart2 size={32} /></div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Bulk Export Center</h3>
              <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs mb-10">Export your master student list and performance data into standardized Excel formats.</p>
           </div>
           <div className="space-y-4">
              <button onClick={() => handleExport('roster')} className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-3 transition-all">Export Roster <Download size={16} /></button>
              <button onClick={() => handleExport('results')} className="w-full h-14 rounded-2xl bg-[#FFD000] text-black font-black text-[10px] uppercase tracking-widest shadow-[0_12px_32px_rgba(255,208,0,0.15)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">Export Results <Download size={16} /></button>
           </div>
        </div>
        <div className={`${GLASS} rounded-[2.5rem] p-10 border-dashed border-white/10 flex flex-col justify-between`}>
           <div className="mb-10">
              <div className="w-14 h-14 rounded-2xl bg-white/5 text-white/30 flex items-center justify-center mb-10"><Layers size={28} /></div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter opacity-50">Custom Analytics</h3>
              <p className="text-white/20 text-xs font-black uppercase tracking-widest leading-relaxed">Advanced dashboard modules are being configured for your institute scale.</p>
           </div>
           <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center"><p className="text-white/10 text-[9px] font-black uppercase tracking-[0.2em]">Deployment in Phase 4</p></div>
        </div>
     </div>
   );
}

// ─── Main Dashboard Screen ──────────────────────────────────────────────────

function DashboardScreen({ center, onSignOut }) {
  const [nav, setNav] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, students: 0, pending: 0, performance: 0 });
  const [results, setResults] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBulkBooking, setShowBulkBooking] = useState(false);

  const fetchData = useCallback(async () => {
    if (!center?.id) return;
    setLoading(true);
    try {
      const { data: bData } = await supabase.from('cma_mock_bookings').select('*').eq('coaching_center_id', center.id).order('created_at', { ascending: false });
      const bRows = bData || []; setBookings(bRows);
      const { data: rData } = await supabase.from('exam_results').select('*').eq('coaching_center_id', center.id).order('uploaded_at', { ascending: false });
      const rRows = rData || []; setResults(rRows);
      const { data: sData } = await supabase.from('cma_mock_students').select('*, cma_mock_bookings(preferred_date, exam_part)').eq('coaching_center_id', center.id);
      const sRows = sData || []; setAllStudents(sRows);
      const passRate = rRows.length > 0 ? Math.round((rRows.filter(r => r.result_status === 'pass').length / rRows.length) * 100) : 0;
      setStats({ total: bRows.length, students: sRows.length, pending: bRows.filter(r => (r.status || 'pending') === 'pending').length, performance: passRate });
    } finally { setLoading(false); }
  }, [center?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'History', icon: Briefcase },
    { id: 'roster', label: 'Candidates', icon: Users },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'reports', label: 'Exports', icon: BarChart2 }
  ];

  return (
    <div className="min-h-screen bg-[#07070f] flex flex-col md:flex-row relative">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${GLASS} border-r border-white/5 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full bg-[#07070f]/80 p-8">
           <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-[#FFD000] flex items-center justify-center text-black shadow-[0_8px_20px_rgba(255,208,0,0.2)]"><Building2 size={20} /></div>
              <div><h2 className="text-white font-black text-sm tracking-tight">INSTITUTE</h2><p className="text-[#FFD000] text-[9px] font-black uppercase tracking-[0.2em]">Platform</p></div>
           </div>
           <nav className="space-y-1">
              {menuItems.map(item => (
                <button key={item.id} onClick={() => { setNav(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${nav === item.id ? 'bg-[#FFD000] text-black shadow-[0_12px_24px_rgba(255,208,0,0.2)]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
                   <item.icon size={16} /> {item.label}
                </button>
              ))}
           </nav>
           <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"><p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1.5 leading-none">Institute ID</p><p className="text-white font-bold text-[11px] truncate whitespace-nowrap">{center.name}</p></div>
              <button onClick={onSignOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 text-white/20 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"><LogOut size={12} /> Sign Out</button>
           </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 flex flex-col min-h-screen relative z-10 overflow-x-hidden">
        <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between backdrop-blur-2xl bg-black/40 border-b border-white/[0.05]">
           <div className="md:hidden"><button onClick={() => setSidebarOpen(true)} className="p-2 text-white/40"><Menu size={24} /></button></div>
           <div className="hidden md:block">
              <h3 className="text-white font-black text-lg tracking-tight capitalize">{nav.replace('_', ' ')}</h3>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">{center.city} Center Database</p>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setShowBulkBooking(true)} className="h-12 px-6 rounded-xl bg-[#FFD000] text-black font-black text-[10px] uppercase tracking-widest shadow-[0_12px_24px_rgba(255,208,0,0.2)] hover:scale-105 active:scale-95 transition-all">New Booking</button>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 relative"><Bell size={18} /><span className="absolute top-0 right-0 w-2 h-2 bg-[#FFD000] rounded-full border-2 border-black" /></div>
           </div>
        </header>

        <div className="flex-1 p-6 md:p-10">
           {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-white/10" size={40} /></div> : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {nav === 'overview' && <OverviewView stats={stats} bookings={bookings} results={results} />}
                 {nav === 'bookings' && <BookingsView bookings={bookings} />}
                 {nav === 'roster' && <RosterView students={allStudents} />}
                 {nav === 'results' && <ResultsView results={results} />}
                 {nav === 'reports' && <ReportsView center={center} students={allStudents} results={results} />}
              </div>
           )}
        </div>
      </main>
      {showBulkBooking && <BulkBookingModal center={center} onClose={() => setShowBulkBooking(false)} onSuccess={() => { setShowBulkBooking(false); fetchData(); }} />}
    </div>
  );
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

export default function InstitutePortal() {
  const [center, setCenter] = useState(null);
  const [view, setView] = useState('entry');
  useEffect(() => { const code = localStorage.getItem('fets_inst_code'); if (code) { /* auto login potential */ } }, []);
  if (view === 'entry') return <EntryScreen onAccessSuccess={(data) => { setCenter(data); setView('dashboard'); }} onRegister={() => setView('register')} />;
  if (view === 'register') return <RegisterScreen onBack={() => setView('entry')} onSuccess={() => setView('entry')} />;
  if (view === 'dashboard' && center) return <DashboardScreen center={center} onSignOut={() => { setCenter(null); setView('entry'); }} />;
  return <EntryScreen onAccessSuccess={(data) => { setCenter(data); setView('dashboard'); }} onRegister={() => setView('register')} />;
}
