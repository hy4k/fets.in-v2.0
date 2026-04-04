import { useState, useEffect } from 'react';
import { MapPin, Phone, X, Mail, Navigation, ArrowRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import AgentChatOverlay from './components/AgentChatOverlay';
import CMAMockBookingModal from './components/CMAMockBookingModal';
import AdminSlotsUpload from './components/AdminSlotsUpload';
import ChatPanels from './components/ChatPanels';
import LoginModal from './components/LoginModal';
import CandidateDashboard from './pages/CandidateDashboard';
import SiteHeader from './components/sections/SiteHeader';
import HeroSection from './components/sections/HeroSection';
import MockExamsSection from './components/sections/MockExamsSection';
import EarlyAccessSection from './components/sections/EarlyAccessSection';
import FAQSection from './components/sections/FAQSection';
import SiteFooter from './components/sections/SiteFooter';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeLocationModal, setActiveLocationModal] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [bookingPrefill, setBookingPrefill] = useState(null);
  const [bookingKey, setBookingKey] = useState(0);
  const [isCMABookingOpen, setIsCMABookingOpen] = useState(false);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [toast, setToast] = useState(null);
  const [adminClicks, setAdminClicks] = useState(0);

  // Auth state
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // URL-based access: ?admin=true opens admin panel, ?book=cma opens booking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setShowAdminUpload(true);
    if (params.get('book') === 'cma') setIsCMABookingOpen(true);
  }, []);

  // Auth session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setShowDashboard(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdminClick = () => {
    const next = adminClicks + 1;
    setAdminClicks(next);
    if (next >= 5) {
      setShowAdminUpload(true);
      setAdminClicks(0);
    }
    setTimeout(() => setAdminClicks(0), 2000);
  };

  const closePanel = () => {
    setActivePanel(null);
    setBookingPrefill(null);
  };

  const navigateToBooking = (prefill) => {
    setBookingPrefill(prefill);
    setBookingKey((k) => k + 1);
    setActivePanel('booking');
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowLoginModal(false);
    setShowDashboard(true);
  };

  const handleSignupSuccess = (newUser) => {
    setUser(newUser);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setUser(null);
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white">
      <SiteHeader
        onOpenChat={() => setIsChatOpen(true)}
        onOpenCalicut={() => setActiveLocationModal('calicut')}
        onOpenKochi={() => setActiveLocationModal('kochi')}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenDashboard={() => setShowDashboard(true)}
        user={user}
      />

      <main>
        <HeroSection onOpenChat={() => setIsChatOpen(true)} />
        <MockExamsSection
          onBookCma={() => setIsCMABookingOpen(true)}
          onBookOther={() => showToast('Call +91 9605686000 or use the calendar to book this exam.')}
        />
        <EarlyAccessSection showToast={showToast} onSignupSuccess={handleSignupSuccess} />
        <FAQSection />
      </main>

      <SiteFooter onOpenCalicut={() => setActiveLocationModal('calicut')} onOpenKochi={() => setActiveLocationModal('kochi')} />

      <CMAMockBookingModal isOpen={isCMABookingOpen} onClose={() => setIsCMABookingOpen(false)} showToast={showToast} />

      {showAdminUpload && <AdminSlotsUpload onClose={() => setShowAdminUpload(false)} />}

      {/* Auth modals */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
      )}

      {/* Candidate dashboard overlay */}
      {showDashboard && user && (
        <CandidateDashboard
          user={user}
          onClose={() => setShowDashboard(false)}
          onLogout={handleLogout}
          onOpenChat={() => { setShowDashboard(false); setIsChatOpen(true); }}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg transition-all ${
            toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      {!isChatOpen && (
        <button type="button" className="fab-ai group" onClick={() => setIsChatOpen(true)} title="Ask EXAM ASSIST">
          <div className="fab-ai-blob" />
          <FabWaveIcon />
        </button>
      )}

      {isChatOpen && <AgentChatOverlay onClose={() => setIsChatOpen(false)} onOpenPanel={setActivePanel} />}

      <button type="button" onClick={handleAdminClick} className="fixed bottom-4 left-4 z-30 h-6 w-6 opacity-0" aria-hidden tabIndex={-1} />

      <ChatPanels
        activePanel={activePanel}
        onClose={closePanel}
        bookingPrefill={bookingPrefill}
        bookingKey={bookingKey}
        onNavigateToBooking={navigateToBooking}
        onOpenCmaMock={() => setIsCMABookingOpen(true)}
        showToast={showToast}
      />

      {activeLocationModal === 'calicut' && (
        <LocationModal
          title="Calicut Centre"
          address="Forun Testing & Educational Services<br/>4th Floor, Kadooli Tower<br/>West Nadakkavu, Vandipetta Junction<br/>Calicut, Kerala, India – 673011"
          phone="+91 495 491 5936"
          reach={{
            train: 'Calicut Railway Station (Approx. 3 KM)',
            bus: 'Calicut New Bus Stand (Approx. 4 KM)',
            air: 'Calicut International Airport (CCJ) (Approx. 22 KM)',
          }}
          mapUrl="https://www.google.com/maps/dir//4th+Floor,+Forun+Educational+and+Testing+Services,+Kadooli+Tower+JN,+West+Nadakkave,+Vandipetta,+Bilathikkulam,+Kozhikode,+Kerala+673011"
          onClose={() => setActiveLocationModal(null)}
          onAskAi={() => {
            setActiveLocationModal(null);
            setIsChatOpen(true);
          }}
        />
      )}
      {activeLocationModal === 'kochi' && (
        <LocationModal
          title="Kochi Centre"
          address="Forun Testing & Educational Services<br/>6th Floor, Manjooran Estate<br/>Behind MRA Hotel, Bypass Junction<br/>Edappally, Kochi, Kerala 682024"
          phone="+91 484 454 1957"
          reach={{
            train: 'Ernakulam Town (ERN) – 6 KM | Ernakulam Junction (ERS) - 8.7 KM',
            metro: 'Edapally Metro Station - 350 Meters',
            bus: 'Kaloor Bus Stand - 5 KM | Vytilla Hub – 8.4 KM',
            air: 'Cochin International Airport (COK) (Approx. 28 KM)',
          }}
          mapUrl="https://www.google.com/maps/dir//6th+Floor,+Manjooran+Estate,Bewhind+MRA+Hotel,+Bypass+Junction,+Edappally,+Kochi,+Kerala+682024"
          onClose={() => setActiveLocationModal(null)}
          onAskAi={() => {
            setActiveLocationModal(null);
            setIsChatOpen(true);
          }}
        />
      )}
    </div>
  );
}

function LocationModal({ title, address, phone, reach, mapUrl, onClose, onAskAi }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content !max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] border border-[#FFD000]/20">
               <MapPin size={20} />
             </div>
             <div>
               <h3 className="modal-title font-black">{title}</h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Authorized Test Infrastructure</p>
             </div>
          </div>
          <button className="skeuo-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <div>
                    <label className="label-premium">Testing Venue Address</label>
                    <p className="text-white text-lg font-bold leading-relaxed tracking-tight" dangerouslySetInnerHTML={{ __html: address }} />
                 </div>

                 <div className="flex flex-wrap gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center gap-3 shadow-inner">
                       <Phone size={16} className="text-[#FFD000]" />
                       <span className="text-sm font-black text-white">{phone}</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 py-4">
                    <button onClick={onAskAi} className="h-14 w-full rounded-2xl bg-[#FFD000] text-dark-950 font-black text-xs uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,208,0,0.15)] group">
                       <FabWaveIcon size={16} /> Message Live Assistant
                    </button>
                    <a href="mailto:mithun@fets.in" className="h-14 w-full rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-xl">
                       <Mail size={16} className="text-white/40" /> Email Support
                    </a>
                 </div>
              </div>

              <div className="p-8 rounded-[32px] bg-black/60 border border-white/5 shadow-inner">
                 <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                    <Compass size={14} className="text-[#FFD000]" /> Transit Directions
                 </h4>
                 <ul className="space-y-6">
                    {Object.entries(reach).map(([key, val]) => (
                      <li key={key} className="flex gap-4">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                            {key === 'train' ? <Train size={14} className="text-orange-400" /> :
                             key === 'metro' ? <Navigation size={14} className="text-blue-400" /> :
                             key === 'bus' ? <Bus size={14} className="text-emerald-400" /> :
                             <Plane size={14} className="text-[#FFD000]" />}
                         </div>
                         <div>
                            <span className="block text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{key} Access</span>
                            <span className="block text-xs font-bold text-white/70 leading-snug">{val}</span>
                         </div>
                      </li>
                    ))}
                 </ul>

                 <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-10 h-14 w-full rounded-2xl bg-white/[0.05] border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#FFD000] hover:text-dark-950 hover:border-transparent transition-all flex items-center justify-center gap-3 group shadow-md">
                    <Navigation size={16} /> Open Physical Map <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const Train = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="15" x="4" y="3" rx="2" />
    <path d="M4 11h16" />
    <path d="M12 3v8" />
    <path d="m8 19-2 3" />
    <path d="m18 22-2-3" />
    <path d="M8 15h.01" />
    <path d="M16 15h.01" />
  </svg>
);

const Compass = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const Bus = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="12" x="4" y="3" rx="2" />
    <path d="M4 11h16" />
    <path d="M8 3v8" />
    <path d="M16 3v8" />
    <path d="M6 15h.01" />
    <path d="M18 15h.01" />
    <path d="M6 19v2" />
    <path d="M18 21v-2" />
  </svg>
);

const Plane = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 5.2c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
  </svg>
);

function FabWaveIcon({ size }) {
  const w = size || 22;
  return (
    <svg width={w} height={Math.round(w * 0.82)} viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="3" height="6" rx="1.5" fill="currentColor" />
      <rect x="4.75" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="9.5" y="0" width="3" height="18" rx="1.5" fill="currentColor" />
      <rect x="14.25" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="19" y="6" width="3" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}
