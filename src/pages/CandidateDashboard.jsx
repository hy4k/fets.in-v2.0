import { useState, useEffect } from 'react';
import { LogOut, X, CheckCircle2, Bell, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CalendarSection from '../components/sections/CalendarSection';
import StudentResourcesSection from '../components/sections/StudentResourcesSection';

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

  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

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
