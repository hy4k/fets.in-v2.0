import { useState } from 'react';
import { MapPin, Phone, Sparkles, X } from 'lucide-react';
import AgentChatOverlay from './components/AgentChatOverlay';
import CMAMockBooking from './components/CMAMockBooking';
import AdminSlotsUpload from './components/AdminSlotsUpload';
import ChatPanels from './components/ChatPanels';
import SiteHeader from './components/sections/SiteHeader';
import HeroSection from './components/sections/HeroSection';
import MockExamsSection from './components/sections/MockExamsSection';
import CalendarSection from './components/sections/CalendarSection';
import StudentResourcesSection from './components/sections/StudentResourcesSection';
import FAQSection from './components/sections/FAQSection';
import EarlyAccessSection from './components/sections/EarlyAccessSection';
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

  return (
    <div className="min-h-screen bg-light-100 font-sans text-dark-900">
      <SiteHeader onOpenCalicut={() => setActiveLocationModal('calicut')} onOpenKochi={() => setActiveLocationModal('kochi')} />

      <main>
        <HeroSection onOpenChat={() => setIsChatOpen(true)} />
        <MockExamsSection
          onBookCma={() => setIsCMABookingOpen(true)}
          onBookOther={() => showToast('Call +91 9605686000 or use the calendar to book this mock.')}
        />
        <CalendarSection />
        <StudentResourcesSection />
        <FAQSection />
        <EarlyAccessSection showToast={showToast} />
      </main>

      <SiteFooter onOpenCalicut={() => setActiveLocationModal('calicut')} onOpenKochi={() => setActiveLocationModal('kochi')} />

      <CMAMockBooking isOpen={isCMABookingOpen} onClose={() => setIsCMABookingOpen(false)} showToast={showToast} />

      {showAdminUpload && <AdminSlotsUpload onClose={() => setShowAdminUpload(false)} />}

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
          <Sparkles size={24} className="text-primary-400 transition-transform group-hover:scale-110" />
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-dark-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-light-300 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-light-100 p-2 text-dark-800 transition-colors hover:bg-light-200">
          <X size={20} />
        </button>
        <div className="p-8">
          <div className="mb-8 flex items-center gap-3 border-b border-light-200 pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-400/20 text-primary-600">
              <MapPin size={24} />
            </div>
            <h2 className="heading-serif text-3xl font-bold text-dark-950 md:text-4xl">{title}</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-12">
            <div>
              <h3 className="mb-4 text-[10px] font-bold tracking-widest text-dark-800 uppercase">Address</h3>
              <p className="mb-6 text-sm leading-relaxed font-medium text-dark-950 lg:text-base" dangerouslySetInnerHTML={{ __html: address }} />

              <div className="mb-8 flex w-max items-center gap-3 rounded-lg bg-primary-400/10 p-3 font-bold text-primary-600">
                <Phone size={18} /> {phone}
              </div>

              <div className="flex flex-col gap-3">
                <button type="button" onClick={onAskAi} className="btn-primary group relative w-full overflow-hidden shadow-sm">
                  <Sparkles size={16} /> Message via EXAM ASSIST
                  <div className="absolute top-0 right-0 h-8 w-8 rounded-bl-full bg-white opacity-20 transition-transform duration-500 group-hover:scale-[3]" />
                </button>
                <a href="mailto:mithun@fets.in" className="btn-secondary flex w-full items-center justify-center gap-2 border-primary-500 text-primary-600 hover:bg-primary-50">
                  Email us
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-light-200 bg-light-100 p-6">
              <h3 className="mb-5 text-[10px] font-bold tracking-widest text-dark-800 uppercase">How to reach us</h3>
              <ul className="space-y-5 text-sm">
                {reach.train && (
                  <li>
                    <strong className="mb-1 block text-dark-950 lg:text-base">By train</strong>
                    <span className="block leading-snug text-dark-800">{reach.train}</span>
                  </li>
                )}
                {reach.metro && (
                  <li>
                    <strong className="mb-1 block text-dark-950 lg:text-base">By metro</strong>
                    <span className="block leading-snug text-dark-800">{reach.metro}</span>
                  </li>
                )}
                {reach.bus && (
                  <li>
                    <strong className="mb-1 block text-dark-950 lg:text-base">By bus</strong>
                    <span className="block leading-snug text-dark-800">{reach.bus}</span>
                  </li>
                )}
                {reach.air && (
                  <li>
                    <strong className="mb-1 block text-dark-950 lg:text-base">By air</strong>
                    <span className="block leading-snug text-dark-800">{reach.air}</span>
                  </li>
                )}
              </ul>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded border border-dark-950 bg-dark-950 py-3.5 text-sm font-bold text-primary-400 shadow-md hover:bg-dark-900"
              >
                <MapPin size={16} /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
