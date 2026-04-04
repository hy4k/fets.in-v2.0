import { useState, useEffect } from 'react';
import { MapPin, Phone, X, Mail, Navigation, ArrowRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import AgentChatOverlay from './components/AgentChatOverlay';
import CMAMockBookingModal from './components/CMAMockBookingModal';
import AdminSlotsUpload from './components/AdminSlotsUpload';
import ChatPanels from './components/ChatPanels';
import LoginModal from './components/LoginModal';
import CandidateDashboard from './pages/CandidateDashboard';
import InstituteDashboard from './pages/InstituteDashboard';
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
  const [showInstituteDashboard, setShowInstituteDashboard] = useState(false);

  // URL-based access: ?admin=true opens admin panel, ?book=cma opens booking, ?institute=true opens institute portal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setShowAdminUpload(true);
    if (params.get('book') === 'cma') setIsCMABookingOpen(true);
    if (params.get('institute') === 'true') setShowInstituteDashboard(true);
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
        <HeroSection />
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

      {/* Institute dashboard overlay */}
      {showInstituteDashboard && (
        <InstituteDashboard onClose={() => setShowInstituteDashboard(false)} />
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

      {/* Floating action buttons — always visible */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        <a
          href="https://wa.me/919605686000"
          target="_blank"
          rel="noopener noreferrer"
          className="fab-phone"
          aria-label="WhatsApp FETS"
          title="WhatsApp +91 9605686000"
        >
          <WhatsAppIcon />
        </a>
        <button
          type="button"
          className={`fab-exam-ai ${isChatOpen ? 'fab-exam-ai--active' : ''}`}
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Ask Exam AI"
          aria-label="Toggle AI chat"
        >
          <div className="fab-exam-ai-ring" />
          {isChatOpen ? <CloseIcon /> : <FabWaveIcon />}
        </button>
      </div>

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

function FabWaveIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="3" height="6" rx="1.5" fill="currentColor" style={{ animation: 'fabWave1 1.1s ease-in-out infinite' }} />
      <rect x="4.75" y="2" width="3" height="14" rx="1.5" fill="currentColor" style={{ animation: 'fabWave2 1.1s ease-in-out 0.12s infinite' }} />
      <rect x="9.5" y="0" width="3" height="18" rx="1.5" fill="currentColor" style={{ animation: 'fabWave3 1.1s ease-in-out 0.24s infinite' }} />
      <rect x="14.25" y="2" width="3" height="14" rx="1.5" fill="currentColor" style={{ animation: 'fabWave2 1.1s ease-in-out 0.36s infinite' }} />
      <rect x="19" y="6" width="3" height="6" rx="1.5" fill="currentColor" style={{ animation: 'fabWave1 1.1s ease-in-out 0.48s infinite' }} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}
