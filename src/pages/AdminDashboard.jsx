import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, Building2, Bell, BookOpen, Trophy, Table2, 
  RefreshCw, LogOut, ChevronRight, Mail, Phone, Calendar as CalIcon, CreditCard, ChevronDown, CheckCircle, Search, Zap
} from 'lucide-react';
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

const ADMIN_PASSWORD = 'fets@in';
const GLASS = "bg-white/[0.02] border border-white/[0.05] backdrop-blur-[40px] saturate-150";

export default function AdminDashboard({ onClose }) {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');

  const authenticate = (e) => {
    e?.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      setAuth(true);
      setErr('');
    } else {
      setErr('Incorrect Command Centre credentials.');
    }
  };

  if (!auth) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07070f] text-white">
        <BgBlobs />
        <div className={`relative w-full max-w-sm rounded-[2rem] p-8 ${GLASS} shadow-2xl overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD000] to-transparent opacity-50" />
          <div className="text-center mb-8">
             <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FFD000] to-[#f5a623] shadow-[0_0_40px_rgba(255,208,0,0.3)]">
                <span className="text-[#0a0a0a] font-black text-2xl">A</span>
             </div>
             <h2 className="text-2xl font-black">FETS Admin</h2>
             <p className="text-white/40 text-sm mt-1">Provide credentials to enter</p>
          </div>
          <form onSubmit={authenticate}>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3.5 mb-2 focus:outline-none focus:border-[#FFD000]/50 text-white font-mono text-center tracking-[0.2em] transition-colors"
              placeholder="••••••"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
            />
            {err && <p className="text-red-400 text-xs text-center font-semibold mb-4">{err}</p>}
            <button type="submit" className="mt-4 w-full h-12 rounded-xl bg-gradient-to-r from-[#FFD000] to-[#f5a623] text-[#0a0a0a] font-black hover:opacity-90 transition-opacity">
              Access Core
            </button>
          </form>
          <button onClick={onClose} className="mt-4 w-full text-center text-xs text-white/30 hover:text-white transition-colors">
            Return to site
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'calendar', icon: BookOpen, label: 'Exam Calendar' },
    { id: 'candidates', icon: Users, label: 'Individuals' },
    { id: 'institutes', icon: Building2, label: 'Institutes' },
    { id: 'leads', icon: Mail, label: 'Enquiries / Leads' },
    { id: 'early_access', icon: Zap, label: 'Early Access' },
    { id: 'results', icon: Table2, label: 'Results' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#07070f] text-white">
      <BgBlobs />
      
      {/* Sidebar */}
      <aside className={`w-64 shrink-0 flex flex-col ${GLASS} border-y-0 border-l-0 z-10`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD000] to-[#f5a623] flex items-center justify-center shadow-[0_0_20px_rgba(255,208,0,0.3)]">
              <span className="text-[#0a0a0a] font-black">F</span>
            </div>
            <div>
              <h1 className="font-black tracking-tight leading-none text-lg">FETS</h1>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFD000]">Command Center</span>
            </div>
          </div>

          <nav className="space-y-2">
            {TABS.map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === t.id 
                    ? 'bg-gradient-to-r from-[#FFD000] to-[#f5a623] text-[#0a0a0a] shadow-[0_4px_20px_rgba(255,208,0,0.2)]'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/[0.05]">
          <button 
            onClick={() => { setAuth(false); onClose && onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-red-400 transition-colors text-sm font-semibold"
          >
            <LogOut size={16} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <header className={`h-16 shrink-0 flex items-center justify-between px-8 border-b border-white/[0.05] ${GLASS}`}>
           <h2 className="font-bold text-lg">{TABS.find(t=>t.id===activeTab)?.label}</h2>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-xs font-mono text-white/40">ADMIN_ACTIVE</span>
           </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 relative">
           {activeTab === 'calendar' && <CalendarView />}
           {activeTab === 'candidates' && <CandidatesView />}
           {activeTab === 'institutes' && <InstitutesView />}
           {activeTab === 'leads' && <EnquiriesView />}
           {activeTab === 'early_access' && <LeadsView />}
           {activeTab === 'results' && <ResultsView />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CalendarView() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('mock_exam_slots').select('*').order('date');
    if (data) setSlots(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await fetchSlots();
    };
    load();
    return () => { mounted = false; };
  }, [fetchSlots]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">Real-time status of all scheduled examinations.</p>
        <button onClick={fetchSlots} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"><RefreshCw size={16} className={loading?'animate-spin text-[#FFD000]':'text-white/40'}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map(s => {
          const occ = s.total_seats > 0 ? (s.booked_seats / s.total_seats) * 100 : 0;
          return (
            <div key={s.id} className={`p-6 rounded-2xl ${GLASS} relative overflow-hidden group`}>
               <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#FFD000] blur-[50px] opacity-[0.05] group-hover:opacity-10 transition-opacity" style={{ transform: 'translate(30%, -30%)' }} />
               
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <span className="inline-block px-2.5 py-1 rounded-md bg-[#FFD000]/10 text-[#FFD000] text-[10px] font-black uppercase tracking-wider mb-2">
                     {new Date(s.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                   </span>
                   <h3 className="text-xl font-bold">{s.time_slot}</h3>
                   <p className="text-white/40 text-sm">{s.center}</p>
                 </div>
                 <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                    <CalIcon size={20} className="text-[#FFD000]" />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-white/50">Capacity</span>
                   <span className="font-bold">{s.booked_seats} <span className="text-white/30">/ {s.total_seats}</span></span>
                 </div>
                 <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[#FFD000] to-[#ffaa00] rounded-full transition-all duration-1000" style={{ width: `${occ}%` }} />
                 </div>
               </div>
            </div>
          )
        })}
      </div>
      {slots.length === 0 && !loading && <div className="text-center py-20 text-white/30">No slots available.</div>}
    </div>
  );
}

function CandidatesView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('cma_mock_bookings')
      .select('*')
      .eq('booking_type', 'direct')
      .order('created_at', { ascending: false });
    if(data) setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await fetchData();
    };
    load().catch(console.error);
    return () => { mounted = false; };
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{rows.length} individual bookings found.</p>
        <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06]"><RefreshCw size={16} className={loading?'animate-spin text-[#FFD000]':'text-white/40'}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.map(r => (
          <div key={r.id} className={`p-5 rounded-2xl ${GLASS} flex flex-col`}>
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h4 className="font-bold text-lg mb-1">{r.lead_name || 'Individual'}</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/[0.05] text-white/70 tracking-widest">{r.exam_part}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${r.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>{r.payment_status}</span>
                  </div>
               </div>
               {r.confirmation_code && <div className="text-xs font-mono bg-[#FFD000]/10 text-[#FFD000] px-2 py-1 rounded-md">{r.confirmation_code}</div>}
             </div>
             
             <div className="space-y-2 text-sm text-white/50 mt-auto pt-4 border-t border-white/[0.05]">
                <div className="flex items-center gap-2"><Mail size={14} className="shrink-0"/> <span className="truncate">{r.lead_email}</span></div>
                <div className="flex items-center gap-2"><Phone size={14} className="shrink-0"/> <span className="truncate">{r.lead_phone}</span></div>
                <div className="flex items-center gap-2"><CalIcon size={14} className="shrink-0"/> <span className="truncate">{r.preferred_date} • {r.session_time}</span></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstitutesView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [roster, setRoster] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Modified to fetch from cma_mock_bookings for institutional bookings
    // Assuming coachings center name is in lead_name or joined
    const { data } = await supabase.from('cma_mock_bookings')
      .select('*, coaching_centers(name, city)')
      .eq('booking_type', 'institutional')
      .order('created_at', { ascending: false });
    if(data) setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await fetchData();
    };
    load().catch(console.error);
    return () => { mounted = false; };
  }, [fetchData]);

  const toggleRoster = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    if (!roster[id]) {
      const { data } = await supabase.from('cma_mock_students').select('student_name').eq('booking_id', id);
      setRoster(prev => ({...prev, [id]: data || []}));
    }
    setExpandedId(id);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{rows.length} institutional bookings found.</p>
        <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06]"><RefreshCw size={16} className={loading?'animate-spin text-[#FFD000]':'text-white/40'}/></button>
      </div>

      <div className="space-y-4">
         {rows.map(r => {
           const ccName = r.coaching_centers?.name || r.lead_name || 'Unknown Institute';
           return (
             <div key={r.id} className={`rounded-2xl ${GLASS} overflow-hidden`}>
               <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => toggleRoster(r.id)}>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#FFD000]/10 flex items-center justify-center border border-[#FFD000]/20 shrink-0">
                       <Building2 size={24} className="text-[#FFD000]" />
                     </div>
                     <div>
                       <h4 className="font-bold text-lg leading-tight">{ccName}</h4>
                       <p className="text-xs text-white/40 mt-1">{r.exam_part} • {r.preferred_date} • {r.session_time}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right hidden md:block">
                       <div className="text-white font-bold">{r.student_count} Candidates</div>
                       <div className={`text-[10px] font-bold uppercase tracking-widest ${r.payment_status==='paid'?'text-emerald-400':'text-red-400'}`}>{r.payment_status}</div>
                     </div>
                     <ChevronDown size={20} className={`text-white/40 transition-transform ${expandedId===r.id ? 'rotate-180':''}`} />
                  </div>
               </div>
               
               {expandedId === r.id && (
                 <div className="p-6 border-t border-white/[0.05] bg-white/[0.01]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Booking Details</h5>
                        <div className="space-y-2 text-sm text-white/70">
                          {r.confirmation_code && <div className="flex justify-between"><span>Confirmation Code:</span><span className="font-mono text-[#FFD000]">{r.confirmation_code}</span></div>}
                          <div className="flex justify-between"><span>Payment Context:</span><span>{r.payment_method}</span></div>
                          <div className="flex justify-between"><span>Total Enrolled:</span><span>{r.student_count}</span></div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Roster list</h5>
                        <ul className="text-sm text-white/70 space-y-1">
                          {roster[r.id]?.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-white/30">{i+1}.</span> {s.student_name}
                            </li>
                          ))}
                          {!roster[r.id]?.length && <li className="text-white/30">No students found.</li>}
                        </ul>
                      </div>
                    </div>
                 </div>
               )}
             </div>
           );
         })}
      </div>
    </div>
  );
}

function EnquiriesView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if(data) setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{rows.length} general enquiries found.</p>
        <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06]"><RefreshCw size={16} className={loading?'animate-spin text-[#FFD000]':'text-white/40'}/></button>
      </div>
      <div className="space-y-4">
        {rows.map(r => (
          <div key={r.id} className={`p-6 rounded-2xl ${GLASS} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400 font-black">
                   <Mail size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-lg">{r.name}</h4>
                   <p className="text-xs text-white/40">{r.email} • {r.phone}</p>
                </div>
             </div>
             <div className="flex-1 px-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD000] mb-1">Interest: {r.exam_interest || 'General'}</div>
                <p className="text-sm text-white/60 line-clamp-2 italic">"{r.message}"</p>
             </div>
             <div className="text-right">
                <div className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-1">{new Date(r.created_at).toLocaleDateString()}</div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">{r.status}</span>
             </div>
          </div>
        ))}
        {rows.length === 0 && <div className="p-20 text-center text-white/20 text-sm font-bold uppercase tracking-widest">No enquiries recorded</div>}
      </div>
    </div>
  );
}

function LeadsView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('early_access_leads').select('*').order('created_at', { ascending: false });
    if(data) setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await fetchData();
    };
    load().catch(console.error);
    return () => { mounted = false; };
  }, [fetchData]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{rows.length} early access leads collected.</p>
        <button onClick={fetchData} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06]"><RefreshCw size={16} className={loading?'animate-spin text-[#FFD000]':'text-white/40'}/></button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rows.map(r => (
          <div key={r.id} className={`p-5 rounded-2xl ${GLASS} flex items-start gap-4`}>
             <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center font-black text-[#FFD000] shrink-0">
               {r.full_name?.charAt(0)}
             </div>
             <div className="min-w-0 flex-1">
               <h4 className="font-bold truncate text-[15px]">{r.full_name}</h4>
               <p className="text-[10px] text-[#FFD000] font-bold uppercase tracking-widest mt-0.5">{r.interested_exam}</p>
               <div className="mt-3 space-y-1 text-xs text-white/50">
                 <p className="truncate hover:text-white/80 select-all">{r.email}</p>
                 <p className="hover:text-white/80 select-all">{r.phone}</p>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsView() {
  const [results, setResults] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const fetchExistingResults = useCallback(async () => {
    const { data } = await supabase.from('exam_results').select('*').order('uploaded_at', { ascending: false });
    if (data) setResults(data);
  }, []);

  useEffect(() => {
    fetchExistingResults();
  }, [fetchExistingResults]);

  const fetchFromCoStudy = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('costudy-get-results', {
        body: { all: true } // Requesting all results for the dashboard
      });
      
      if (error) throw error;
      
      if (data?.results) {
        // Here we could upsert into our own database to cache
        // But for now let's just show what we got
        await fetchExistingResults(); // Refresh from local DB if the edge function saves them
      }
    } catch (err) {
      console.error('CoStudy Sync Error:', err);
      alert('Failed to sync with CoStudy: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/[0.03] border border-white/[0.05] p-6 rounded-[2rem]">
        <div>
           <h3 className="text-xl font-black mb-1">CoStudy Synchronization</h3>
           <p className="text-white/40 text-sm">Fetch latest examination scores and candidate performance data.</p>
        </div>
        <button 
          onClick={fetchFromCoStudy}
          disabled={syncing}
          className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${
            syncing 
              ? 'bg-white/[0.1] text-white/30 cursor-not-allowed' 
              : 'bg-[#FFD000] text-[#0a0a0a] hover:opacity-90 shadow-[0_0_20px_rgba(255,208,0,0.2)]'
          }`}
        >
          {syncing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {syncing ? 'Syncing...' : 'Fetch Results'}
        </button>
      </div>

      <div className={`overflow-hidden rounded-[2rem] ${GLASS}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.01]">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Candidate</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Examination</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Score</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {results.map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm">{r.student_name}</div>
                  <div className="text-[10px] text-white/30">{r.candidate_email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-white/60">{r.exam_part || 'CMA Mock'}</td>
                <td className="px-6 py-4">
                   <span className="font-mono font-black text-[#FFD000]">{r.score || '—'}</span>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                     r.result_status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 
                     r.result_status === 'fail' ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.05] text-white/40'
                   }`}>
                     {r.result_status || 'Pending'}
                   </span>
                </td>
                <td className="px-6 py-4 text-xs text-white/30">
                  {r.exam_date ? new Date(r.exam_date).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center text-white/20">
                  <Trophy size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold">No results recorded yet.</p>
                  <p className="text-xs mt-1">Click 'Fetch Results' to sync with CoStudy.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
