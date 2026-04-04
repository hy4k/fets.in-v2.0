import { useState, useEffect, useCallback } from 'react';
import { LogOut, X, CheckCircle2, Bell, ChevronRight, Loader2, Trophy, ClipboardList, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CalendarSection from '../components/sections/CalendarSection';
import StudentResourcesSection from '../components/sections/StudentResourcesSection';

// ── Period helpers ───────────────────────────────────────────────────────────
const BI_PERIODS = ['Jan – Feb','Mar – Apr','May – Jun','Jul – Aug','Sep – Oct','Nov – Dec'];
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
    const parseKey = k => { const y = parseInt(k.slice(-4)); const p = BI_PERIODS.findIndex(x => k.startsWith(x)); return y * 10 + p; };
    return parseKey(b[0]) - parseKey(a[0]);
  });
}

function AiWaveIcon({ size = 20 }) {
  return (
    <svg width={size} height={Math.round(size * 0.82)} viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="3" height="6" rx="1.5" fill="currentColor" />
      <rect x="4.75" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="9.5" y="0" width="3" height="18" rx="1.5" fill="currentColor" />
      <rect x="14.25" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="19" y="6" width="3" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export default function CandidateDashboard({ user, onClose, onLogout, onOpenChat }) {
  const [profile, setProfile] = useState(null);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  // Bookings & results
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const fetchBookings = useCallback(async () => {
    if (!supabase || !user?.email) return;
    setBookingsLoading(true);
    const { data } = await supabase
      .from('cma_mock_bookings')
      .select('*')
      .eq('lead_email', user.email)
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setBookingsLoading(false);
  }, [user]);

  const fetchResults = useCallback(async () => {
    if (!supabase || !user?.email) return;
    setResultsLoading(true);
    const { data } = await supabase
      .from('exam_results')
      .select('*')
      .eq('candidate_email', user.email.toLowerCase())
      .order('uploaded_at', { ascending: false });
    setResults(data || []);
    setResultsLoading(false);
  }, [user]);

  useEffect(() => { fetchBookings(); fetchResults(); }, [fetchBookings, fetchResults]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    onLogout();
  };

  const firstName = profile?.full_name?.split(' ')[0]
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Candidate';
  const examInterest = profile?.interested_exam || user?.user_metadata?.interested_exam || null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0a0a] overflow-y-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="container-custom flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFD000] text-[#0a0a0a] flex items-center justify-center font-black text-base">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{greeting}</p>
              <p className="text-sm font-black text-white leading-none">{firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-white/60 text-xs font-semibold hover:text-white hover:bg-white/10 transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white transition-colors"
              aria-label="Close dashboard"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <main>
        {/* Hero greeting */}
        <div className="container-custom pt-10 pb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-2">Your Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {greeting}, <span className="text-[#FFD000]">{firstName}</span>.
          </h1>
        </div>

        {/* Status cards */}
        <div className="container-custom pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Registration status */}
            <div className="rounded-2xl border border-[#FFD000]/20 bg-[#FFD000]/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-[#FFD000]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD000]">Registered</span>
              </div>
              <p className="text-white font-black text-lg">{examInterest || 'Certification'}</p>
              <p className="text-white/40 text-xs mt-1">You're on the priority list for new exam dates.</p>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-white/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Notifications</span>
              </div>
              <p className="text-white font-black text-lg">Active</p>
              <p className="text-white/40 text-xs mt-1">We'll alert you the moment new slots open.</p>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Quick actions</p>
              <div className="flex flex-col gap-2">
                <a href="#mock-exams" onClick={onClose} className="flex items-center justify-between text-sm text-white/70 hover:text-white transition-colors">
                  <span>Book a Mock Exam</span><ChevronRight size={14} />
                </a>
                <a href="#faq" onClick={onClose} className="flex items-center justify-between text-sm text-white/70 hover:text-white transition-colors">
                  <span>Exam Day FAQ</span><ChevronRight size={14} />
                </a>
                {onOpenChat && (
                  <button type="button" onClick={() => { onClose(); onOpenChat(); }} className="flex items-center justify-between text-sm text-[#FFD000]/80 hover:text-[#FFD000] transition-colors">
                    <span className="flex items-center gap-1.5"><AiWaveIcon size={13} /> Ask Exam AI</span><ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── My Bookings ── */}
        <div className="container-custom pb-10">
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList size={16} className="text-[#FFD000]" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">My CMA Mock Bookings</h2>
            {bookings.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD000]/15 text-[#FFD000]">{bookings.length}</span>
            )}
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-white/20"/></div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-8 text-center">
              <p className="text-white/30 text-sm">No bookings yet.</p>
              <p className="text-white/20 text-xs mt-1">Book a CMA US Test Drive to see your registrations here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupByPeriod(bookings, b => b.preferred_date).map(([period, items]) => (
                <div key={period}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{period}</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[10px] font-bold text-white/20">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(b => (
                      <div key={b.id} className="rounded-xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
                        <button
                          onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.booking_type === 'institutional' ? 'bg-blue-500/15 text-blue-400' : 'bg-[#FFD000]/15 text-[#FFD000]'
                            }`}>{b.booking_type === 'institutional' ? 'Bulk' : 'Direct'}</span>
                            <span className="font-bold text-white text-sm truncate">{b.exam_part || 'CMA Mock'}</span>
                            <span className="text-xs text-white/40 shrink-0">{b.preferred_date}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>{b.status || 'pending'}</span>
                            <ChevronDown size={14} className={`text-white/30 transition-transform ${expandedBooking === b.id ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        {expandedBooking === b.id && (
                          <div className="px-5 py-4 border-t border-white/[0.06] grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                            {b.confirmation_code && (
                              <div className="col-span-2">
                                <span className="text-white/40">Booking Code: </span>
                                <span className="font-mono font-black text-[#FFD000] tracking-widest">{b.confirmation_code}</span>
                              </div>
                            )}
                            <div><span className="text-white/40">Session: </span><span className="text-white/70">{b.session_time || '—'}</span></div>
                            <div><span className="text-white/40">Payment: </span><span className="text-white/70">{b.payment_method || '—'}</span></div>
                            <div><span className="text-white/40">Submitted: </span><span className="text-white/70">{b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── My Results ── */}
        <div className="container-custom pb-10">
          <div className="flex items-center gap-3 mb-5">
            <Trophy size={16} className="text-[#FFD000]" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">My Exam Results</h2>
            {results.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD000]/15 text-[#FFD000]">{results.length}</span>
            )}
          </div>

          {resultsLoading ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-white/20"/></div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-8 text-center">
              <p className="text-white/30 text-sm">No results published yet.</p>
              <p className="text-white/20 text-xs mt-1">Results will appear here once FETS publishes them after your exam.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupByPeriod(results, r => r.exam_date).map(([period, items]) => (
                <div key={period}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{period}</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <div className="space-y-2">
                    {items.map(r => (
                      <div key={r.id} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm">{r.student_name}</p>
                          <p className="text-xs text-white/40 mt-0.5">{r.exam_part || 'CMA'} · {r.exam_date ? new Date(r.exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {r.score != null && (
                            <div className="text-center">
                              <p className="text-2xl font-black text-white leading-none">{r.score}</p>
                              <p className="text-[10px] text-white/30 mt-0.5">Score</p>
                            </div>
                          )}
                          <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${
                            r.result_status === 'pass' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : r.result_status === 'fail' ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                            : 'bg-white/[0.06] text-white/40 border border-white/[0.08]'
                          }`}>{r.result_status || 'Pending'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar section */}
        <CalendarSection />

        {/* Student resources */}
        <StudentResourcesSection />

        {/* Footer */}
        <div className="container-custom py-8 border-t border-white/[0.06]">
          <p className="text-center text-xs text-white/20 font-semibold uppercase tracking-widest">
            Forun Testing & Educational Services
          </p>
        </div>
      </main>
    </div>
  );
}
