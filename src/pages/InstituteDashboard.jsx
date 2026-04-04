import { useState, useEffect, useCallback } from 'react';
import { X, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp, Building2, LogOut, Users, BookOpen, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * 26)];
  return `FETS-${code}-2026`;
}

function StatusBadge({ value }) {
  const map = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
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

// ─── Entry Screen ─────────────────────────────────────────────────────────────

function EntryScreen({ onAccessSuccess, onRegister }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter an access code.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: dbErr } = await supabase
        .from('coaching_centers')
        .select('*')
        .eq('access_code', code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      if (dbErr) throw dbErr;
      if (!data) throw new Error('Invalid or inactive access code. Please check and try again.');
      onAccessSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#FFD000]/[0.04] blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="font-black text-[#FFD000] text-3xl tracking-tight">FETS</span>
          <span className="w-px h-8 bg-white/10" />
          <span className="text-white/40 font-bold text-sm tracking-widest uppercase">Institute Portal</span>
        </div>
        <p className="text-white/30 text-sm font-medium">Institute &amp; Coaching Centre Partner Dashboard</p>
      </div>

      {/* Two cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {/* Card 1 — Access */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD000]/10 border border-[#FFD000]/20 flex items-center justify-center text-[#FFD000] mb-6">
            <Building2 size={22} />
          </div>
          <h2 className="text-white font-black text-xl mb-2 tracking-tight">I have an access code</h2>
          <p className="text-white/40 text-sm mb-7 leading-relaxed">Enter your institute's unique access code to view your dashboard and manage bookings.</p>

          <form onSubmit={handleAccess} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="FETS-XXXX-2026"
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/20 transition-all font-mono font-black text-center tracking-[0.2em] text-lg uppercase shadow-inner"
              autoComplete="off"
              spellCheck={false}
            />
            {error && (
              <p className="text-red-400 text-xs font-medium text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Access Dashboard &rarr;</>}
            </button>
          </form>
        </div>

        {/* Card 2 — Register */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 mb-6">
            <span className="text-2xl font-black leading-none">+</span>
          </div>
          <h2 className="text-white font-black text-xl mb-2 tracking-tight">Register your institute</h2>
          <p className="text-white/40 text-sm mb-3 leading-relaxed">New to FETS? Get your institute access code and start managing your students' mock exams.</p>
          <p className="text-white/20 text-xs font-medium mb-7">Free to register &bull; No credit card required</p>
          <div className="mt-auto">
            <button
              onClick={onRegister}
              className="w-full py-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white font-black text-sm uppercase tracking-widest hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              Register Now &rarr;
            </button>
          </div>
        </div>
      </div>

      <p className="mt-12 text-white/20 text-xs text-center relative z-10">
        FETS Institute Portal &bull; For support: <a href="mailto:mithun@fets.in" className="text-white/30 hover:text-white/60 transition-colors">mithun@fets.in</a>
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
    if (!name || !contactPerson || !email || !phone) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    const code = generateAccessCode();
    try {
      const { error: dbErr } = await supabase.from('coaching_centers').insert({
        name,
        contact: phone,
        email,
        city,
        contact_name: contactPerson,
        access_code: code,
        is_active: true,
      });
      if (dbErr) throw dbErr;
      setGeneratedCode(code);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        </div>

        <div className="w-full max-w-lg relative z-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Registration Successful!</h1>
          <p className="text-white/50 mb-12 text-sm leading-relaxed">Your institute has been registered. Save your access code — you'll need it to log in.</p>

          {/* Big code display */}
          <div className="rounded-3xl border border-[#FFD000]/20 bg-[#FFD000]/[0.04] p-10 mb-6">
            <p className="text-[10px] font-black text-[#FFD000]/60 uppercase tracking-[0.3em] mb-4">Your Access Code</p>
            <p className="font-mono font-black text-[#FFD000] text-4xl tracking-[0.3em] mb-2">{generatedCode}</p>
            <p className="text-white/30 text-xs mt-3">Keep this code safe — it's your institute's login key</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopy}
              className="w-full py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-bold text-sm hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
            >
              {copied ? <><CheckCircle2 size={16} className="text-emerald-400" /> Copied!</> : <><Copy size={16} /> Copy Access Code</>}
            </button>
            <button
              onClick={() => onSuccess(generatedCode)}
              className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
            >
              Access Your Dashboard &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#FFD000]/[0.03] blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-10"
        >
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
            <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Institute Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. ABC Commerce Academy"
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Contact Person Name *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="institute@email.com"
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">City</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium"
              style={{ colorScheme: 'dark' }}
            >
              <option value="Calicut">Calicut</option>
              <option value="Kochi">Kochi</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest">Description <span className="text-white/20">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of your institute..."
              rows={3}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/50 transition-all text-sm font-medium resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,208,0,0.2)]"
          >
            {loading ? <Loader2 size={16} className="animate-spin text-[#0a0a0a]" /> : 'Complete Registration'}
          </button>
        </form>
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

  const fetchData = useCallback(async () => {
    if (!supabase || !center?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cma_mock_bookings')
        .select('*')
        .eq('coaching_center_id', center.id)
        .order('created_at', { ascending: false });
      const rows = data || [];
      setBookings(rows);
      const total = rows.length;
      const students = rows.reduce((s, r) => s + (r.student_count || 0), 0);
      const pending = rows.filter(r => (r.status || 'pending') === 'pending').length;
      setStats({ total, students, pending });
    } finally {
      setLoading(false);
    }
  }, [center?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleExpand = async (bookingId) => {
    if (expanded === bookingId) { setExpanded(null); return; }
    setExpanded(bookingId);
    if (studentMap[bookingId]) return;
    setLoadingStudents(p => ({ ...p, [bookingId]: true }));
    const { data } = await supabase
      .from('cma_mock_students')
      .select('student_name')
      .eq('booking_id', bookingId);
    setStudentMap(p => ({ ...p, [bookingId]: data || [] }));
    setLoadingStudents(p => ({ ...p, [bookingId]: false }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Ambient */}
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
              {center.city && (
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  {center.city}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-white/40 text-sm font-medium">Your CMA Mock Exam bookings and student activity</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-10 flex-col sm:flex-row">
          <StatCard label="Total Bookings" value={stats.total} icon={BookOpen} accent="bg-[#FFD000]/10 text-[#FFD000]" />
          <StatCard label="Total Students" value={stats.students} icon={Users} accent="bg-blue-500/10 text-blue-400" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} accent="bg-amber-500/10 text-amber-400" />
        </div>

        {/* Bookings section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight">Mock Exam Bookings</h2>
          <button onClick={fetchData} className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={30} className="animate-spin text-[#FFD000]/40" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
            <BookOpen size={36} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 font-bold text-sm uppercase tracking-wider">No bookings yet</p>
            <p className="text-white/20 text-xs mt-2">Use the button below to book a mock exam for your students</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_1fr_0.6fr_1fr_40px] gap-4 px-5 py-2">
              {['Date Submitted', 'Exam Part', 'Preferred Date', 'Session', 'Students', 'Status', ''].map(h => (
                <span key={h} className="text-[10px] font-black text-white/30 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {bookings.map(b => (
              <div key={b.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.1] transition-colors">
                <button
                  onClick={() => toggleExpand(b.id)}
                  className="w-full grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_0.6fr_1fr_40px] gap-4 items-center px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white/70">
                    {b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                  </span>
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
                    {loadingStudents[b.id] ? (
                      <Loader2 size={16} className="animate-spin text-white/20" />
                    ) : (studentMap[b.id]?.length || 0) === 0 ? (
                      <p className="text-white/20 text-xs font-medium">No students recorded for this booking.</p>
                    ) : (
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

        {/* Book CTA */}
        <div className="mt-12 rounded-3xl border border-[#FFD000]/10 bg-[#FFD000]/[0.03] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-white mb-1 tracking-tight">Book a Mock Exam</h3>
            <p className="text-white/40 text-sm">Schedule a CMA mock exam session for your students at FETS.</p>
          </div>
          <button
            onClick={() => { window.location.href = '/?book=cma'; }}
            className="shrink-0 px-8 py-4 rounded-2xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.2)] whitespace-nowrap"
          >
            Book Mock Exam &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InstituteDashboard({ onClose }) {
  const [view, setView] = useState('entry'); // entry | register | dashboard
  const [center, setCenter] = useState(null);

  const handleAccessSuccess = (centerData) => {
    setCenter(centerData);
    setView('dashboard');
  };

  const handleRegisterSuccess = async (code) => {
    // Re-fetch the center by code
    const { data } = await supabase
      .from('coaching_centers')
      .select('*')
      .eq('access_code', code)
      .maybeSingle();
    if (data) {
      setCenter(data);
      setView('dashboard');
    }
  };

  const handleSignOut = () => {
    setCenter(null);
    setView('entry');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      {/* Close button (only when not in dashboard — dashboard has sign out) */}
      {view !== 'dashboard' && onClose && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[90] p-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
        >
          <X size={18} />
        </button>
      )}

      {view === 'entry' && (
        <EntryScreen
          onAccessSuccess={handleAccessSuccess}
          onRegister={() => setView('register')}
        />
      )}
      {view === 'register' && (
        <RegisterScreen
          onSuccess={handleRegisterSuccess}
          onBack={() => setView('entry')}
        />
      )}
      {view === 'dashboard' && center && (
        <DashboardScreen
          center={center}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}
