import { useState } from 'react';
import { Calendar as CalendarIcon, ClipboardList, BookOpen, MapPin, Sparkles, Phone, ArrowRight, CheckCircle2, Bell, X, Settings } from 'lucide-react';
import AgentChatOverlay from './components/AgentChatOverlay';
import CMAMockBooking from './components/CMAMockBooking';
import AdminSlotsUpload from './components/AdminSlotsUpload';
import { examDates } from './data/siteData';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeLocationModal, setActiveLocationModal] = useState(null);
  // Panel management for Chat overlay interactions
  const [activePanel, setActivePanel] = useState(null);
  // CMA Mock Booking
  const [isCMABookingOpen, setIsCMABookingOpen] = useState(false);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [toast, setToast] = useState(null);
  // Admin access: click footer 5× times quickly
  const [adminClicks, setAdminClicks] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdminClick = () => {
    const next = adminClicks + 1;
    setAdminClicks(next);
    if (next >= 5) { setShowAdminUpload(true); setAdminClicks(0); }
    setTimeout(() => setAdminClicks(0), 2000);
  };

  return (
    <div className="min-h-screen bg-light-100 font-sans text-dark-900">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-light-50/90 backdrop-blur-md border-b border-light-300 z-40 flex items-center shadow-sm">
        <div className="container-custom flex justify-center items-center w-full">
          <div className="hidden md:flex items-center justify-center flex-wrap gap-3 font-semibold text-sm w-full">
            <button onClick={() => setActiveLocationModal('calicut')} className="btn-nav gap-1"><MapPin size={14}/> Calicut Centre</button>
            <button onClick={() => setActiveLocationModal('kochi')} className="btn-nav gap-1"><MapPin size={14}/> Kochi Centre</button>
            <a href="#mock-exams" className="btn-nav">Mock Exams</a>
            <a href="#calendar" className="btn-nav">Check Availability</a>
            <a href="#early-access" className="btn-nav">Early Access</a>
            <a href="#calendar" className="btn-nav">Book Exam</a>
            <a href="tel:+919605686000" className="btn-nav gap-1 md:ml-auto">
              <Phone size={14} /> +91 9605686000
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-20">
        
        {/* HERO SECTION */}
        <section className="py-20 md:py-28 relative overflow-hidden bg-light-100">
          
          {/* Animated Vibrant Background Orbs (Uses user's palette) */}
          <div className="absolute top-10 left-1/4 w-72 md:w-[500px] h-72 md:h-[500px] bg-[#FFD150]/20 rounded-full blur-[80px] mix-blend-multiply animate-blob pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-72 md:w-[400px] h-72 md:h-[400px] bg-[#458B73]/15 rounded-full blur-[80px] mix-blend-multiply animate-blob animation-delay-2000 pointer-events-none" />
          <div className="absolute -bottom-8 left-1/3 w-80 md:w-[600px] h-80 md:h-[600px] bg-[#F26076]/10 rounded-full blur-[80px] mix-blend-multiply animate-blob animation-delay-4000 pointer-events-none" />
          
          <div className="container-custom text-center relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            
            {/* Elegant Context Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 backdrop-blur-md border border-light-300 text-dark-800 text-[11px] font-bold tracking-[0.2em] uppercase mb-12 shadow-sm animate-fade-in-up">
              <Sparkles size={14} className="text-primary-500" />
              AI-Powered Examination Hub
            </div>

            {/* Main Logo Container */}
            <div className="relative mb-16 animate-fade-in-up animation-delay-200 flex justify-center w-full">
               <img src="/images/logos/forun-logo.png" alt="Forun Testing & Educational Services" className="h-28 sm:h-36 md:h-44 object-contain mix-blend-multiply" />
            </div>

            {/* Elevated CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 w-full sm:w-auto animate-fade-in-up animation-delay-400">
              <a href="#calendar" className="btn-nav h-14 px-10 text-[15px] bg-white hover:bg-transparent shadow-sm">
                Check Exam Dates <ArrowRight size={18} className="ml-2" />
              </a>
              <button onClick={() => setIsChatOpen(true)} className="btn-nav h-14 px-10 text-[15px] bg-white hover:bg-transparent shadow-sm">
                Ask EXAM ASSIST <Sparkles size={18} className="text-primary-500 ml-2" />
              </button>
            </div>

            {/* Glassmorphic Client Logos Shelf */}
            <div className="flex flex-col items-center w-full max-w-4xl animate-fade-in-up animation-delay-600">
              <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-6 border-b border-light-300/50 pb-2 px-8">CERTIFIED TESTING PARTNERS</h4>
              <div className="flex justify-center flex-wrap items-center gap-8 md:gap-14 lg:gap-16 bg-white/60 backdrop-blur-lg border border-light-200/60 rounded-[2rem] px-8 py-8 md:py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full transition-transform hover:-translate-y-1">
                <img src="/images/logos/prometric.png" alt="Prometric" className="h-10 md:h-12 object-contain hover:scale-105 transition-transform duration-300" />
                <img src="/images/logos/pearson-vue.png" alt="Pearson VUE" className="h-10 md:h-12 object-contain hover:scale-105 transition-transform duration-300" />
                <img src="/images/logos/celpip.jpg" alt="CELPIP" className="h-10 md:h-12 mix-blend-multiply object-contain hover:scale-105 transition-transform duration-300" />
                <img src="/images/logos/cma-usa.png" alt="CMA" className="h-12 md:h-16 object-contain hover:scale-105 transition-transform duration-300" />
                <img src="/images/logos/psi.png" alt="PSI" className="h-12 md:h-16 object-contain hover:scale-105 transition-transform duration-300" />
              </div>
            </div>

          </div>
        </section>

        {/* MOCK EXAMS SECTION */}
        <section id="mock-exams" className="section-padding bg-light-100">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h4 className="text-overline mb-3">Mock Exams</h4>
              <h2 className="heading-serif text-4xl md:text-5xl font-semibold text-dark-950">Practice in Real Exam Conditions</h2>
              <p className="text-dark-800 mt-4 max-w-2xl mx-auto">Familiarize yourself with the testing environment and format through our authentic mock test experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'CMA US Mock Test', dur: '4 hours', feat: '100 MCQs + 2 Essays', price: '₹2,500', isCMA: true, list: ['Real exam simulation', 'Detailed performance analysis', 'Expert feedback session', 'Study plan recommendations'] },
                { name: 'CELPIP Mock Test', dur: '3 hours', feat: 'Listening, Reading, Writing, Speaking', price: '₹2,000', isCMA: false, list: ['Full test simulation', 'Speaking practice with feedback', 'Writing evaluation', 'Score estimate'] },
                { name: 'IELTS Mock Test', dur: '2h 45min', feat: 'All 4 modules', price: '₹1,800', isCMA: false, list: ['Academic/General options', 'Band score estimate', 'Detailed feedback', 'Improvement tips'] },
              ].map((mock, i) => (
                <div key={i} className="clean-card bg-[#f8f8f4] flex flex-col h-full border border-light-300 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-400 opacity-5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                  <div className="mb-4 text-primary-500">
                    <ClipboardList size={28} />
                  </div>
                  <h3 className="heading-serif text-2xl font-semibold mb-2 text-dark-950">{mock.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-dark-800 mb-4 font-medium">
                    <span className="flex items-center gap-1"><CalendarIcon size={14}/> {mock.dur}</span>
                    <span className="flex items-center gap-1"><BookOpen size={14}/> {mock.feat}</span>
                  </div>
                  <div className="text-3xl font-bold text-primary-500 mb-6">{mock.price}</div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {mock.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-dark-900 border-b border-light-200 pb-2">
                        <CheckCircle2 size={16} className="text-primary-500 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => mock.isCMA ? setIsCMABookingOpen(true) : null}
                    className="w-full btn-primary shadow-sm hover:shadow-md mt-auto"
                  >
                    Book Mock Test <ArrowRight size={16}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXAM CALENDAR SECTION */}
        <section id="calendar" className="section-padding bg-white border-t border-light-200">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h4 className="text-overline mb-3">Exam Calendar</h4>
              <h2 className="heading-serif text-4xl md:text-5xl font-semibold text-dark-950">Check Available Exam Dates</h2>
              <p className="text-dark-800 mt-4 max-w-2xl mx-auto">Browse and book available slots for your preferred certification exam.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <select className="input-clean w-48 font-semibold bg-light-100 shadow-sm cursor-pointer border-light-300 text-dark-950">
                <option>All Exams</option>
                <option>CMA US</option>
                <option>CELPIP</option>
                <option>IELTS</option>
                <option>Prometric</option>
              </select>
              <select className="input-clean w-48 font-semibold bg-light-100 shadow-sm cursor-pointer border-light-300 text-dark-950">
                <option>All Locations</option>
                <option>Calicut</option>
                <option>Kochi</option>
              </select>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8 font-semibold text-dark-950 text-lg">
              <button className="w-8 h-8 rounded-full border border-light-300 flex items-center justify-center hover:bg-light-200 transition-colors shadow-sm">&lt;</button>
              <span className="flex items-center gap-2"><CalendarIcon size={18} className="text-primary-500"/> April 2026</span>
              <button className="w-8 h-8 rounded-full border border-light-300 flex items-center justify-center hover:bg-light-200 transition-colors shadow-sm">&gt;</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {examDates.slice(0, 16).map((slot, i) => (
                <div key={i} className="calendar-card relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-dark-950 text-sm">{slot.exam}</h4>
                    {slot.status === 'booked' ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-light-200 text-dark-800 px-2 py-0.5 rounded-sm">Booked</span>
                    ) : (
                      <CheckCircle2 size={16} className="text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-dark-800 mb-1 font-medium">
                    <MapPin size={12}/> @ {slot.location}
                  </div>
                  <div className="text-xs text-dark-800 font-medium mb-4 flex items-center gap-1 pl-0.5">
                    <CalendarIcon size={11} className="text-primary-500"/> {slot.time}
                  </div>
                  <button 
                    disabled={slot.status === 'booked'}
                    className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-all border break-words ${
                      slot.status === 'booked' 
                        ? 'bg-light-200 text-dark-800/50 cursor-not-allowed border-light-300' 
                        : 'bg-primary-400 text-dark-950 border-primary-500 hover:bg-primary-500 shadow-sm'
                    }`}
                  >
                    {slot.status === 'booked' ? 'Unavailable' : 'Book Slot'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GET EARLY ACCESS SECTION */}
        <section id="early-access" className="section-padding bg-[#f4ece0]">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h4 className="text-overline mb-3 text-primary-600">Exclusive Access</h4>
                <h2 className="heading-serif text-4xl md:text-5xl font-semibold mb-6 text-dark-950">Get Early Access to Exam Dates</h2>
                <p className="text-dark-800 mb-8 leading-relaxed">
                  Register with us to be the first to know about opening dates for exams, especially for CMA US and CELPIP candidates. This exclusive service is designed to give you a competitive advantage in your certification journey.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'First to know about new exam dates',
                    'Exclusive early bird discounts',
                    'Priority booking for CMA US & CELPIP',
                    'Free study material updates',
                    'Exam tips and preparation guides'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-dark-950 font-medium text-sm">
                      <CheckCircle2 size={18} className="text-primary-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-primary-600 font-bold text-sm bg-primary-400/10 px-4 py-2 rounded-lg inline-flex">
                  <Star size={16} fill="currentColor"/> Especially for CMA US & CELPIP Candidates
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-light-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary-400 flex items-center justify-center text-dark-950 shrink-0">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="heading-serif text-2xl font-bold text-dark-950">Register for Updates</h3>
                    <p className="text-sm text-dark-800">Join our exclusive notification list</p>
                  </div>
                </div>
                
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-dark-950 pl-1">Full Name</label>
                    <input type="text" placeholder="Enter your full name" className="input-clean" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-dark-950 pl-1">Email Address</label>
                    <input type="email" placeholder="Enter your email" className="input-clean" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-dark-950 pl-1">Phone Number</label>
                    <input type="tel" placeholder="Enter your phone number" className="input-clean" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-dark-950 pl-1">Interested Exam</label>
                    <select className="input-clean cursor-pointer">
                      <option>Select an exam</option>
                      <option>CMA US</option>
                      <option>CELPIP</option>
                      <option>IELTS</option>
                      <option>Other</option>
                    </select>
                    <p className="text-[10px] text-dark-800 mt-1 pl-1 flex items-center gap-1"><Sparkles size={10} className="text-primary-500"/> Priority notification exams</p>
                  </div>
                  <button className="w-full btn-primary h-12 text-base shadow-sm hover:shadow-lg mt-2 font-bold">
                    Register for Exclusive Updates
                  </button>
                  <p className="text-[10px] text-center text-dark-800 pt-2 leading-relaxed px-4">
                    By registering, you agree to receive notifications about exam dates and related services. You can unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* CMA MOCK BOOKING MODAL */}
      <CMAMockBooking
        isOpen={isCMABookingOpen}
        onClose={() => setIsCMABookingOpen(false)}
        showToast={showToast}
      />

      {/* ADMIN SLOTS UPLOAD */}
      {showAdminUpload && (
        <AdminSlotsUpload onClose={() => setShowAdminUpload(false)} />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all animate-fade-in-up border ${
          toast.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          <CheckCircle2 size={16} /> {toast.message}
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      {!isChatOpen && (
        <button 
          className="fab-ai group"
          onClick={() => setIsChatOpen(true)}
          title="Ask EXAM ASSIST"
        >
          <div className="fab-ai-blob"></div>
          <Sparkles size={24} className="text-primary-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* CHAT OVERLAY */}
      {isChatOpen && (
        <AgentChatOverlay 
          onClose={() => setIsChatOpen(false)} 
          onOpenPanel={(panel) => setActivePanel(panel)} 
        />
      )}

      {/* HIDDEN ADMIN TRIGGER — click 5× within 2 seconds */}
      <button
        onClick={handleAdminClick}
        className="fixed bottom-4 left-4 w-6 h-6 opacity-0 z-30"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* LOCATION MODALS */}
      {activeLocationModal === 'calicut' && (
        <LocationModal 
          title="Calicut Centre"
          address="Forun Testing & Educational Services<br/>4th Floor, Kadooli Tower<br/>West Nadakkavu, Vandipetta Junction<br/>Calicut, Kerala, India – 673011"
          phone="+91 495 491 5936"
          reach={{
            train: "Calicut Railway Station (Approx. 3 KM)",
            bus: "Calicut New Bus Stand (Approx. 4 KM)",
            air: "Calicut International Airport (CCJ) (Approx. 22 KM)"
          }}
          mapUrl="https://www.google.com/maps/dir//4th+Floor,+Forun+Educational+and+Testing+Services,+Kadooli+Tower+JN,+West+Nadakkave,+Vandipetta,+Bilathikkulam,+Kozhikode,+Kerala+673011"
          onClose={() => setActiveLocationModal(null)}
          onAskAi={() => { setActiveLocationModal(null); setIsChatOpen(true); }}
        />
      )}
      {activeLocationModal === 'kochi' && (
        <LocationModal 
          title="Kochi Centre"
          address="Forun Testing & Educational Services<br/>6th Floor, Manjooran Estate<br/>Behind MRA Hotel, Bypass Junction<br/>Edappally, Kochi, Kerala 682024"
          phone="+91 484 454 1957"
          reach={{
            train: "Ernakulam Town (ERN) – 6 KM | Ernakulam Junction (ERS) - 8.7 KM",
            metro: "Edapally Metro Station - 350 Meters",
            bus: "Kaloor Bus Stand - 5 KM | Vytilla Hub – 8.4 KM",
            air: "Cochin International Airport (COK) (Approx. 28 KM)"
          }}
          mapUrl="https://www.google.com/maps/dir//6th+Floor,+Manjooran+Estate,Bewhind+MRA+Hotel,+Bypass+Junction,+Edappally,+Kochi,+Kerala+682024"
          onClose={() => setActiveLocationModal(null)}
          onAskAi={() => { setActiveLocationModal(null); setIsChatOpen(true); }}
        />
      )}

      {/* SLIDE-IN PANELS (Placeholder for now since we are replacing the logic) */}
      {activePanel && (
        <div className="panel-backdrop z-50">
          <div className="panel-drawer p-6 flex items-center justify-center font-bold text-center">
            Functionality Triggered: {activePanel.toUpperCase()}
            <button onClick={() => setActivePanel(null)} className="absolute top-4 right-4 p-2 bg-light-200 rounded-full hover:bg-light-300">
              <X size={20}/>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Needed because it's not imported directly above
function Star({ size, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function LocationModal({ title, address, phone, reach, mapUrl, onClose, onAskAi }) {
  return (
    <div className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative border border-light-300 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-light-100 hover:bg-light-200 rounded-full transition-colors text-dark-800 z-10">
          <X size={20} />
        </button>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-light-200">
            <div className="w-12 h-12 rounded-full bg-primary-400/20 text-primary-600 flex items-center justify-center shrink-0">
              <MapPin size={24} />
            </div>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold text-dark-950">{title}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left">
            <div>
              <h3 className="text-[10px] font-bold text-dark-800 uppercase tracking-widest mb-4">Address</h3>
              <p className="text-dark-950 font-medium leading-relaxed text-sm lg:text-base mb-6" dangerouslySetInnerHTML={{ __html: address }}></p>
              
              <div className="flex items-center gap-3 text-primary-600 font-bold mb-8 bg-primary-400/10 p-3 rounded-lg w-max">
                <Phone size={18} /> {phone}
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={onAskAi} className="btn-primary w-full flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group">
                  <Sparkles size={16} className="text-dark-950" /> Message via EXAM ASSIST
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white opacity-20 rounded-bl-full group-hover:scale-[3] transition-transform duration-500"></div>
                </button>
                <a href="mailto:mithun@fets.in" className="btn-secondary w-full flex items-center justify-center gap-2 border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors">
                   Send Message Us
                </a>
              </div>
            </div>
            
            <div className="bg-light-100 p-6 rounded-xl border border-light-200">
              <h3 className="text-[10px] font-bold text-dark-800 uppercase tracking-widest mb-5">How to Reach Us</h3>
              <ul className="space-y-5 text-sm">
                {reach.train && (
                  <li>
                    <strong className="block text-dark-950 mb-1 lg:text-base">By Train:</strong>
                    <span className="text-dark-800 leading-snug block">{reach.train}</span>
                  </li>
                )}
                {reach.metro && (
                  <li>
                    <strong className="block text-dark-950 mb-1 lg:text-base">By Metro:</strong>
                    <span className="text-dark-800 leading-snug block">{reach.metro}</span>
                  </li>
                )}
                {reach.bus && (
                  <li>
                    <strong className="block text-dark-950 mb-1 lg:text-base">By Bus:</strong>
                    <span className="text-dark-800 leading-snug block">{reach.bus}</span>
                  </li>
                )}
                {reach.air && (
                  <li>
                    <strong className="block text-dark-950 mb-1 lg:text-base">By Air:</strong>
                    <span className="text-dark-800 leading-snug block">{reach.air}</span>
                  </li>
                )}
              </ul>
              
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-8 block w-full bg-dark-950 text-primary-400 font-bold py-3.5 rounded hover:bg-dark-900 transition-colors text-sm shadow-md flex items-center justify-center gap-2 border border-dark-950">
                <MapPin size={16} /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
