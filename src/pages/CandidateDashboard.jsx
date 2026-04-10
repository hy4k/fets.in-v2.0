import { useState, useEffect, useCallback } from 'react';
import { 
  LogOut, X, CheckCircle2, ChevronRight, Loader2, Trophy, 
  ClipboardList, ChevronDown, LayoutDashboard, Calendar, BookOpen, 
  ArrowRight, Target, Award, Zap, User, Star, Download, Settings
} from 'lucide-react';
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

const GLASS = 'bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.03)]';
const GLASS_SM = 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]';

function BgBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-[#FFD000]/[0.03] blur-[150px]" />
      <div className="absolute top-[20%] -right-60 w-[600px] h-[600px] rounded-full bg-blue-500/[0.02] blur-[130px]" />
      <div className="absolute -bottom-40 left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.02] blur-[120px]" />
    </div>
  );
}

// ── Sub-Views ────────────────────────────────────────────────────────────────

function OverviewView({ stats, bookings, results, onOpenChat, onSwitchTab }) {
  const nextExam = bookings.find(b => b.status === 'confirmed' || b.status === 'pending');
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Live Bookings" value={stats.bookings} icon={ClipboardList} color="#FFD000" />
          <StatCard label="Exams Taken" value={stats.exams} icon={Award} color="#3b82f6" />
          <StatCard label="Peak Accuracy" value={stats.accuracy} icon={Target} color="#10b981" suffix="%" />
          <StatCard label="Study Streak" value="12" icon={Zap} color="#f59e0b" suffix="Days" />
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6 flex flex-col">
             {nextExam ? (
                <div className={`${GLASS} rounded-[2rem] p-8 relative overflow-hidden group flex-1`}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/10 blur-[60px]" />
                   <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-6">Upcoming Examination</h3>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[#FFD000] font-black">
                         <span className="text-[10px] uppercase">{new Date(nextExam.preferred_date).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-2xl -mt-1">{new Date(nextExam.preferred_date).getDate()}</span>
                      </div>
                      <div>
                         <h4 className="text-white font-black text-2xl tracking-tight">{nextExam.exam_part || 'CMA Mock'}</h4>
                         <p className="text-white/40 text-sm font-medium">{nextExam.session_time || 'General Session'}</p>
                      </div>
                   </div>
                   <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Confirmation code</div>
                      <div className="text-[#FFD000] font-mono font-black tracking-widest">{nextExam.confirmation_code || 'PENDING'}</div>
                   </div>
                </div>
             ) : (
                <div className={`${GLASS} rounded-[2rem] p-10 text-center border-dashed border-white/10 flex-1 flex flex-col justify-center`}>
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/20">
                      <Calendar size={24} />
                   </div>
                   <h3 className="text-white font-black text-lg mb-2">No active bookings</h3>
                   <p className="text-white/40 text-sm font-medium max-w-xs mx-auto mb-8 leading-relaxed">Schedule your next CMA Test Drive and track your progress here.</p>
                   <button onClick={() => onSwitchTab('bookings')} className="h-12 px-8 self-center rounded-full bg-[#FFD000] text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Schedule Exam Now</button>
                </div>
             )}

             <div className={`${GLASS} rounded-[2rem] p-8`}>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-6">Recent Results</h3>
                <div className="space-y-4">
                   {results.slice(0, 2).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#FFD000] transition-colors"><Trophy size={18} /></div>
                            <div>
                               <p className="text-white font-bold text-sm tracking-tight">{r.exam_part}</p>
                               <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">{new Date(r.exam_date).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-white font-black text-lg">{r.score}</span>
                            <span className="text-white/20 text-[10px] uppercase font-black ml-1">pts</span>
                         </div>
                      </div>
                   ))}
                   {results.length === 0 && <p className="text-white/20 text-xs font-black uppercase text-center py-8">No results available yet</p>}
                   {results.length > 0 && <button onClick={() => onSwitchTab('results')} className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#FFD000] transition-colors">View All Results</button>}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className={`${GLASS} rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between h-full group`}>
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-600/10 blur-[80px] group-hover:bg-blue-600/20 transition-all duration-1000" />
                <div>
                   <h3 className="text-white/30 font-black text-xs uppercase tracking-[0.3em] mb-6">Study Hub</h3>
                   <h2 className="text-4xl font-black text-white mb-6 leading-[1.1] tracking-tighter">Your pathway to global certification starts here.</h2>
                   <p className="text-white/40 text-sm font-medium leading-relaxed mb-10">We've updated our resources section with the latest CMA Part 1 Mock materials. Check them out to stay ahead.</p>
                </div>
                <div className="flex flex-wrap gap-4 mt-auto">
                   <button onClick={onOpenChat} className="flex-1 h-14 rounded-2xl bg-[#FFD000] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_8px_32px_rgba(255,208,0,0.2)]">Ask Exam AI <ArrowRight size={16} /></button>
                   <button onClick={() => onSwitchTab('resources')} className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Explore Materials</button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function StatCard({ label, value, icon: LucideIcon, color, suffix }) {
  return (
    <div className={`${GLASS} rounded-3xl p-6 relative overflow-hidden group`}>
       <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40`} style={{ background: color }} />
       <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', color }}>
                <LucideIcon size={18} />
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

function ExamsView({ bookings, loading, expandedBooking, setExpandedBooking }) {
   return (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-2">
           <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Examination History</h2>
              <p className="text-white/40 text-sm font-medium">Track your scheduled sessions and previous registrations.</p>
           </div>
        </div>

        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-white/10" /></div>
        ) : bookings.length === 0 ? (
           <div className={`${GLASS} rounded-[2rem] p-20 text-center border-dashed border-white/10`}>
              <p className="text-white/20 text-sm font-black uppercase tracking-widest">No bookings found</p>
           </div>
        ) : (
           <div className="space-y-6">
              {groupByPeriod(bookings, b => b.preferred_date).map(([period, items]) => (
                <div key={period} className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                     <span className="text-[10px] font-black text-[#FFD000] uppercase tracking-[0.3em]">{period}</span>
                     <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     {items.map(b => (
                       <div key={b.id} className={`${GLASS} rounded-[2rem] overflow-hidden transition-all duration-300 ${expandedBooking === b.id ? 'ring-1 ring-[#FFD000]/30 shadow-[0_0_40px_rgba(255,208,0,0.1)]' : ''}`}>
                         <button onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)} className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 text-left">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-white/40 font-black border border-white/5">
                                  <span className="text-[9px] uppercase">{new Date(b.preferred_date).toLocaleString('default', { month: 'short' })}</span>
                                  <span className="text-xl -mt-1">{new Date(b.preferred_date).getDate()}</span>
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-1">
                                     <h4 className="text-white font-black text-lg tracking-tight">{b.exam_part || 'CMA Mock'}</h4>
                                     <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{b.status || 'pending'}</span>
                                  </div>
                                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{b.session_time} • {b.booking_type}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6 self-end md:self-auto">
                               {b.confirmation_code && <div className="hidden lg:block font-mono text-xs text-[#FFD000] bg-[#FFD000]/5 px-3 py-1.5 rounded-lg border border-[#FFD000]/10 tracking-widest">{b.confirmation_code}</div>}
                               <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 transition-transform duration-300" style={{ transform: expandedBooking === b.id ? 'rotate(180deg)' : 'none' }}>
                                  <ChevronDown size={18} />
                               </div>
                            </div>
                         </button>
                         {expandedBooking === b.id && (
                           <div className="px-8 pb-8 pt-2 border-t border-white/5 bg-white/[0.01] animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
                                 <div><label className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Booking ID</label><p className="text-white font-mono text-xs truncate">#{b.id.slice(0, 8)}</p></div>
                                 <div><label className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Payment Method</label><p className="text-white font-bold text-xs uppercase tracking-widest">{b.payment_method || 'PENDING'}</p></div>
                                 <div><label className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Payment Status</label><p className={`text-xs font-black uppercase tracking-widest ${b.payment_status === 'paid' ? 'text-emerald-400' : 'text-red-400'}`}>{b.payment_status}</p></div>
                                 <div><label className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Submitted On</label><p className="text-white font-bold text-xs">{new Date(b.created_at).toLocaleDateString()}</p></div>
                              </div>
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
   );
}

function ResultsView({ results, loading }) {
   return (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Academic Achievement</h2>
           <p className="text-white/40 text-sm font-medium">Verified scores and performance benchmarks from your mock examinations.</p>
        </div>

        {loading ? (
            <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-white/10" /></div>
        ) : results.length === 0 ? (
            <div className={`${GLASS} rounded-[2rem] p-20 text-center border-dashed border-white/10`}>
               <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/10">
                  <Trophy size={32} />
               </div>
               <p className="text-white/20 text-sm font-black uppercase tracking-widest">No results published yet</p>
               <p className="text-white/10 text-xs mt-2 max-w-xs mx-auto">Scores are typically uploaded within 48-72 hours post-examination.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {results.map(r => (
                  <div key={r.id} className={`${GLASS} rounded-[2.5rem] p-8 flex flex-col group hover:border-[#FFD000]/30 transition-all duration-500`}>
                     <div className="flex items-center justify-between mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#FFD000] transition-colors"><Award size={24} /></div>
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${r.result_status === 'pass' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{r.result_status}</span>
                     </div>
                     <h4 className="text-white font-black text-2xl tracking-tighter mb-1">{r.exam_part}</h4>
                     <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-8">{new Date(r.exam_date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                     
                     <div className="mt-auto pt-8 border-t border-white/5 flex items-end justify-between">
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Final Score</div>
                           <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black text-white tracking-tighter">{r.score}</span>
                              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Pts</span>
                           </div>
                        </div>
                        <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-[#FFD000] hover:text-black transition-all group-hover:scale-110 shadow-lg">
                           <Download size={18} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
        )}
     </div>
   );
}

// ── Main Dashboard Component ─────────────────────────────────────────────────

export default function CandidateDashboard({ user, onClose, onLogout, onOpenChat }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  const fetchData = useCallback(async () => {
    if (!supabase || !user?.email) return;
    setLoading(true);
    try {
      const { data: prof } = await supabase.from('candidate_profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      const { data: bks } = await supabase.from('cma_mock_bookings').select('*').eq('lead_email', user.email).order('created_at', { ascending: false });
      setBookings(bks || []);

      const { data: res } = await supabase.from('exam_results').select('*').eq('candidate_email', user.email.toLowerCase()).order('uploaded_at', { ascending: false });
      setResults(res || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = {
    bookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    exams: results.length,
    accuracy: results.length > 0 ? Math.round((results.filter(r => r.result_status === 'pass').length / results.length) * 100) : 0,
  };

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'exams', icon: ClipboardList, label: 'My Exams' },
    { id: 'results', icon: Trophy, label: 'Results' },
    { id: 'bookings', icon: Calendar, label: 'Plan & Book' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
  ];

  const handleLogoutClick = async () => {
    if (supabase) await supabase.auth.signOut();
    onLogout();
  };

  const firstName = profile?.full_name?.split(' ')[0]
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Candidate';

  return (
    <div className="fixed inset-0 z-[100] bg-[#07070f] flex flex-col md:flex-row text-white overflow-hidden">
      <BgBlobs />
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${GLASS} border-r border-white/5 transition-transform duration-500 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full bg-[#07070f]/80 p-8">
           <div className="flex items-center gap-4 mb-14">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD000] to-[#ffaa00] flex items-center justify-center text-[#0a0a0a] shadow-[0_8px_24px_rgba(255,208,0,0.3)]">
                 <User size={24} />
              </div>
              <div>
                 <h2 className="font-black text-sm tracking-tight leading-none mb-1">{firstName.toUpperCase()}</h2>
                 <p className="text-[#FFD000] text-[9px] font-black uppercase tracking-[0.2em]">Candidate Portal</p>
              </div>
           </div>

           <nav className="space-y-2">
              {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === item.id ? 'bg-[#FFD000] text-black shadow-[0_12px_24px_rgba(255,208,0,0.2)]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                >
                   <item.icon size={18} /> {item.label}
                </button>
              ))}
           </nav>

           <div className="mt-auto space-y-4">
              <div className={`${GLASS_SM} rounded-2xl p-4 flex items-center gap-3 border-white/5 bg-white/[0.02]`}>
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20"><Star size={14} /></div>
                 <div>
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Elite Status</p>
                    <p className="text-white font-bold text-[10px]">CMA CANDIDATE</p>
                 </div>
              </div>
              <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest leading-none">
                 <LogOut size={14} /> Sign Out
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-y-auto relative z-10 custom-scrollbar">
         {/* Top Header */}
         <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between backdrop-blur-3xl bg-black/40 border-b border-white/[0.05]">
            <div className="flex items-center gap-6">
               <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-white/30 hover:text-white transition-colors"><ChevronRight size={24} /></button>
               <h3 className="hidden md:block text-white font-black text-xl tracking-tight">{greeting}, {firstName}</h3>
            </div>
            
            <div className="flex items-center gap-4">
               <button onClick={onOpenChat} className={`${GLASS_SM} h-12 px-6 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-black transition-all border border-white/10 group shadow-lg`}>
                  <Zap size={16} className="text-[#FFD000] group-hover:text-black transition-colors" /> AI Assistance
               </button>
               <button onClick={onClose} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><X size={20} /></button>
            </div>
         </header>

         {/* Content View */}
         <div className="flex-1 p-6 md:p-12">
            <div className="max-w-7xl mx-auto h-full">
               {activeTab === 'overview' && <OverviewView stats={stats} bookings={bookings} results={results} onOpenChat={onOpenChat} onSwitchTab={setActiveTab} />}
               {activeTab === 'exams' && <ExamsView bookings={bookings} loading={loading} expandedBooking={expandedBooking} setExpandedBooking={setExpandedBooking} />}
               {activeTab === 'results' && <ResultsView results={results} loading={loading} />}
               
               {activeTab === 'bookings' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     <div className="mb-10">
                        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Plan Your Session</h2>
                        <p className="text-white/40 text-sm font-medium mt-1 uppercase tracking-widest">Select a center and view available slots for your next mock examination.</p>
                     </div>
                     <div className={`${GLASS} rounded-[2.5rem] overflow-hidden`}>
                        <div className="p-8 md:p-12 bg-white/[0.01]">
                           <CalendarSection />
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'resources' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
                     <div className="mb-10">
                        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Knowledge Base</h2>
                        <p className="text-white/40 text-sm font-medium mt-1 uppercase tracking-widest">Premium study materials and examination guidelines curated for your success.</p>
                     </div>
                     <div className={`${GLASS} rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-white/[0.01]`}>
                        <StudentResourcesSection />
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Backdrop for mobile sidebar */}
         {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden" onClick={() => setSidebarOpen(false)} />}
      </main>
    </div>
  );
}
