<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ClipboardList,
  BookOpen,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Bell,
  X,
  ChevronDown,
  Clock,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  ShieldCheck,
  Star,
} from "lucide-react";
import AgentChatOverlay from "./components/AgentChatOverlay";
import Footer from "./components/Footer";
import HeroBackground from "./components/HeroBackground";
import CMAMockBookingModal from "./components/CMAMockBookingModal";
import { supabase } from "./lib/supabase";

/* ==========================================================
   FAQ DATA — "Questions candidates ask us"
   Short, punchy yet comprehensive answers
   ========================================================== */
const faqItems = [
  {
    q: "What exams can I take here?",
    a: "We host CMA US (IMA), CELPIP, IELTS, TOEFL, GRE, ACCA, AWS, Cisco, CompTIA, MRCS (RCS), Microsoft certifications, and all Prometric & Pearson VUE exams. Two fully-equipped centres — Calicut & Kochi.",
  },
  {
    q: "How do I book my exam slot?",
    a: "Visit our exam calendar above, pick your preferred date & centre, and click 'Book Slot'. You'll get instant confirmation via email and WhatsApp. For Prometric/Pearson exams, you can also book directly through their portals — we'll still see you on exam day.",
  },
  {
    q: "What should I bring on exam day?",
    a: "Two valid government-issued photo IDs (passport recommended), your scheduling confirmation email, and nothing else. Lockers are provided free of charge. No phones, bags, watches, or food allowed inside the testing room.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. Most exams allow rescheduling up to 48 hours before the appointment at no extra cost. Cancellation policies vary by exam vendor — CMA US allows 30+ days for a full refund, CELPIP needs 7+ days. Our team can guide you through the process.",
  },
  {
    q: "Do you offer mock tests?",
    a: "Absolutely. We run full-simulation mock tests for CMA US (Part 1 & Part 2), CELPIP General, and IELTS — inside the actual exam room with identical software. It's the closest thing to the real exam without the pressure. Check our Mock Exams section below.",
  },
  {
    q: "How do I reach the centre?",
    a: "Calicut Centre: 4th Floor, Kadooli Tower, West Nadakkavu — 3 km from Railway Station. Kochi Centre: 6th Floor, Manjooran Estate, Edappally — just 350m from Edapally Metro Station. Google Maps links are in the location buttons above.",
  },
  {
    q: "Is there parking available?",
    a: "Yes, both centres have dedicated parking. Calicut has basement parking, and the Kochi centre is adjacent to the Lulu Mall area with ample public parking. Arrive 30 minutes early for a stress-free start.",
  },
  {
    q: "What makes FETS different?",
    a: "We're one of the very few centres in India authorized for both Prometric AND Pearson VUE. Climate-controlled rooms, biometric security, 24/7 CCTV, noise-cancelling headsets, and a dedicated exam-day support team. With us since 2019, over 10,000+ exams conducted.",
  },
];
=======
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
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4

export default function App() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeLocationModal, setActiveLocationModal] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
<<<<<<< HEAD
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Early Access / Auth state
  const [authMode, setAuthMode] = useState("register"); // 'register' | 'login'
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    interested_exam: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Mock Exam Booking state
  const [mockBookingModal, setMockBookingModal] = useState(false);
  const [mockSelected, setMockSelected] = useState(null);
  const [mockForm, setMockForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
  });
  const [mockFormLoading, setMockFormLoading] = useState(false);
  const [mockFormSuccess, setMockFormSuccess] = useState(false);

  const handleBookMock = async (e) => {
    e.preventDefault();
    if (!mockForm.name || !mockForm.email || !mockForm.phone) return;

    setMockFormLoading(true);
    try {
      const { error } = await supabase.from("mock_exam_bookings").insert({
        mock_name: mockSelected?.name || "CMA US Mock Test",
        full_name: mockForm.name,
        email: mockForm.email,
        phone: mockForm.phone,
        preferred_date: mockForm.date || null,
      });
      if (error) throw error;

      setMockFormSuccess(true);
      setTimeout(() => {
        setMockBookingModal(false);
        setMockForm({ name: "", email: "", phone: "", date: "" });
        setMockFormSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Mock Booking Error:", err);
      alert("Failed to book mock test. Please try again.");
    } finally {
      setMockFormLoading(false);
    }
  };

  const handleFormChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.full_name, phone: formData.phone },
        },
      });
      if (authError) throw authError;

      // 2. Create candidate profile
      const { error: profileError } = await supabase
        .from("candidate_profiles")
        .insert({
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          interested_exam: formData.interested_exam,
        });
      if (profileError) throw profileError;

      // 3. Also store in early_access_leads for admin tracking
      await supabase.from("early_access_leads").insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        interested_exam: formData.interested_exam,
        user_id: authData.user.id,
      });

      setFormSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || "Login failed. Check your credentials.");
    } finally {
      setFormLoading(false);
    }
=======
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
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
  };

  return (
    <div className="min-h-screen bg-light-100 font-sans text-dark-900">
<<<<<<< HEAD
      {/* HEADER — Clean Nav with Bigger Buttons */}
      <header
        className="fixed top-0 left-0 right-0 bg-light-50/90 backdrop-blur-md border-b border-light-300 z-40 flex items-center shadow-sm"
        style={{ height: "4.5rem" }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 flex justify-center items-center">
          <div className="hidden lg:flex items-center justify-center gap-2 font-semibold w-full">
            {/* Left side */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveLocationModal("calicut")}
                className="btn-nav gap-1.5"
              >
                <MapPin size={16} /> Calicut Centre
              </button>
              <button
                onClick={() => setActiveLocationModal("kochi")}
                className="btn-nav gap-1.5"
              >
                <MapPin size={16} /> Kochi Centre
              </button>
            </div>

            {/* Middle group */}
            <div className="flex gap-2 ml-auto">
              <a href="#early-access" className="btn-nav">
                Check Availability
              </a>
              <a href="#early-access" className="btn-nav">
                Early Access
              </a>
              <div className="w-4"></div> {/* A little bit of space */}
              <a href="#mock-exams" className="btn-nav">
                Mock Exams
              </a>
            </div>

            {/* Right side (AI + Contact) */}
            <div className="flex gap-2 items-center ml-auto">
              <button
                onClick={() => setIsChatOpen(true)}
                className="btn-nav gap-2 bg-dark-950 text-[#FFD000] border-transparent shadow hover:bg-dark-900 transition-all font-bold group px-4"
              >
                <NeuralOrbInline /> Exam Assist
              </button>

              <div className="flex items-center gap-1.5 ml-1">
                <a
                  href="tel:+919605686000"
                  title="Call Us"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-light-200 hover:bg-light-300 text-dark-800 transition-colors border border-light-300"
                >
                  <Phone size={18} />
                </a>
                <a
                  href="mailto:contact@fets.in"
                  title="Message Us"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-light-200 hover:bg-light-300 text-dark-800 transition-colors border border-light-300"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ paddingTop: "4.5rem" }}>
        {/* ============================================
            SECTION 1: HERO — Supabase-inspired Clean Dark
            ============================================ */}
        <section className="hero-dark-section relative overflow-hidden">
          {/* Plain Dark Background Reference as Requested */}

          {/* Content */}
          <div className="hero-dark-content">
            <h1 className="hero-dark-heading animate-fade-in-up">
              Forun Testing
              <br />
              <span className="hero-dark-accent">
                &amp; Educational Services
              </span>
            </h1>

            <p className="hero-dark-sub animate-fade-in-up animation-delay-200">
              Kerala's Premier Prometric & Pearson VUE Authorized Testing
              Center.
              <br className="hidden sm:block" />
              CMA US, CELPIP, IELTS, TOEFL, GRE, ACCA — Calicut & Kochi.
            </p>

            <div className="hero-dark-ctas animate-fade-in-up animation-delay-300">
              <a href="#early-access" className="hero-dark-btn-primary">
                Book Your Exam <ArrowRight size={18} />
              </a>
              <button
                onClick={() => setIsChatOpen(true)}
                className="hero-dark-btn-secondary"
              >
                Ask Exam Assist
                <NeuralOrbInline />
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 2: FAQ — Dialogue Thread
            Conversational layout — candidate asks, FETS answers
            ================================================== */}
        <section className="dialogue-section section-padding relative" id="faq">
          <div className="container-custom relative z-10">
            {/* Split Header: YOU ASK ● WE ANSWER */}
            <div className="dialogue-header">
              <span className="dialogue-header-block dialogue-header-you">
                You Ask.
              </span>
              <div className="dialogue-header-separator">
                <span className="sep-line"></span>
                <span className="sep-dot"></span>
                <span className="sep-line"></span>
              </div>
              <span className="dialogue-header-block dialogue-header-we">
                We Answer.
              </span>
            </div>
            <p
              className="text-center text-dark-800/50 text-sm mb-12 -mt-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Direct from the candidate hotline — zero fluff.
            </p>

            {/* Dialogue Thread */}
            <div className="dialogue-thread">
              {faqItems.map((item, i) => (
                <div key={i} className="dialogue-pair">
                  {/* Question bubble */}
                  <div
                    className="dialogue-question"
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? -1 : i)}
                  >
                    <div>
                      <div className="dialogue-question-label">Candidate</div>
                      {item.q}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-[#FFD000]/40 shrink-0 transition-transform duration-300 ${
                        openFaqIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Answer bubble — appears on click */}
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-in-out ${
                      openFaqIndex === i
                        ? "max-h-72 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="dialogue-answer">
                      <div className="dialogue-answer-label">FETS Team</div>
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA below FAQ */}
            <div className="text-center mt-12">
              <p
                className="text-dark-800/50 text-sm mb-3"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Can't find your question?
              </p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-dark-950 text-primary-400 hover:bg-dark-900 transition-all shadow-lg"
              >
                <NeuralOrbInline /> Ask EXAM ASSIST
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECTION 3: MOCK EXAMS — Liquid Glass Design
            Frosted transparent cards with refraction borders
            ===================================================== */}
        <section
          id="mock-exams"
          className="liquid-glass-section section-padding relative"
        >
          <div className="container-custom relative z-10">
            <div className="text-center mb-14">
              <span className="text-[11px] font-bold text-[#FFD000]/60 uppercase tracking-[0.2em]">
                Mock Exams
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4"
                style={{ textShadow: "0 2px 20px rgba(255, 208, 0, 0.15)" }}
              >
                Practice in{" "}
                <span className="heading-serif italic text-[#FFD000]">
                  Real Exam Conditions
                </span>
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto">
                Familiarize yourself with the testing environment and format
                through our authentic mock test experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CMA US Mock Test — Full details */}
              <div className="liquid-glass-card flex flex-col h-full">
                <div className="mb-4">
                  <ClipboardList size={28} className="text-[#FFD000]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  CMA US Mock Test
                </h3>
                <div className="flex items-center gap-3 text-sm text-white/50 mb-3 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> 4 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} /> 100 MCQs + 2 Essays
                  </span>
                </div>
                <div className="text-3xl font-black text-[#FFD000] mb-6">
                  ₹2,500
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Real exam simulation",
                    "Detailed performance analysis",
                    "Expert feedback session",
                    "Study plan recommendations",
                  ].map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-white/60 border-b border-white/5 pb-2"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-[#FFD000] mt-0.5 shrink-0"
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setMockSelected({
                      name: "CMA US Mock Test",
                      price: 2500,
                      duration: "4 hours",
                      questions: "100 MCQs + 2 Essays",
                    });
                    setMockBookingModal(true);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#FFD000] text-dark-950 hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,208,0,0.25)]"
                >
                  Book Mock Test <ArrowRight size={16} />
                </button>
              </div>

              {/* CELPIP Mock Test — Coming Soon */}
              <div className="liquid-glass-card liquid-glass-card--coming-soon flex flex-col h-full">
                <div className="mb-4">
                  <ClipboardList size={28} className="text-white/30" />
                </div>
                <h3 className="text-xl font-bold text-white/60 mb-2">
                  CELPIP Mock Test
                </h3>
                <div className="flex items-center gap-3 text-sm text-white/30 mb-3 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> 3 hours
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} /> Full 4-Section Test
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <div className="coming-soon-badge">✦ Coming Soon</div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Full test simulation",
                    "Speaking practice with feedback",
                    "Writing evaluation",
                    "Score estimate",
                  ].map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-white/30 border-b border-white/5 pb-2"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-white/20 mt-0.5 shrink-0"
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-white/5 text-white/30 cursor-not-allowed border border-white/10 flex items-center justify-center gap-2"
                >
                  Notify Me <Bell size={16} />
                </button>
              </div>

              {/* IELTS Mock Test — Coming Soon */}
              <div className="liquid-glass-card liquid-glass-card--coming-soon flex flex-col h-full">
                <div className="mb-4">
                  <ClipboardList size={28} className="text-white/30" />
                </div>
                <h3 className="text-xl font-bold text-white/60 mb-2">
                  IELTS Mock Test
                </h3>
                <div className="flex items-center gap-3 text-sm text-white/30 mb-3 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> 2h 45min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} /> All 4 Modules
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <div className="coming-soon-badge">✦ Coming Soon</div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Academic/General options",
                    "Band score estimate",
                    "Detailed feedback",
                    "Improvement tips",
                  ].map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-white/30 border-b border-white/5 pb-2"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-white/20 mt-0.5 shrink-0"
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-white/5 text-white/30 cursor-not-allowed border border-white/10 flex items-center justify-center gap-2"
                >
                  Notify Me <Bell size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            EARLY ACCESS — Claymorphism + Skeuomorphism Fusion
            Registration with Supabase Auth + Login Toggle
            ====================================================== */}
        <section
          id="early-access"
          className="early-access-section section-padding relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="ea-bg-orb ea-bg-orb--1" aria-hidden="true"></div>
          <div className="ea-bg-orb ea-bg-orb--2" aria-hidden="true"></div>
          <div className="ea-bg-grid" aria-hidden="true"></div>

          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* LEFT — Info panel */}
              <div className="animate-fade-in-up">
                <div className="ea-overline-badge">
                  <ShieldCheck size={14} />
                  Exclusive Candidate Access
                </div>
                <h2
                  className="text-4xl md:text-5xl lg:text-[3.2rem] font-black text-dark-950 leading-[1.1] mb-6"
                  style={{ textShadow: "2px 2px 0px rgba(255, 208, 0, 0.12)" }}
                >
                  Get Early Access
                  <br />
                  <span className="text-primary-500">to Exam Dates</span>
                </h2>
                <p className="text-dark-800/80 mb-8 leading-relaxed text-[15px]">
                  Create your free FETS account to unlock priority booking,
                  early date alerts, and an exclusive candidate dashboard —
                  designed for CMA US and CELPIP candidates.
                </p>

                {/* Benefit cards — Claymorphism */}
                <div className="space-y-3 mb-8">
                  {[
                    {
                      icon: "🔔",
                      title: "First to Know",
                      desc: "Early alerts before public dates open",
                    },
                    {
                      icon: "💰",
                      title: "Exclusive Discounts",
                      desc: "Early bird pricing on mock tests",
                    },
                    {
                      icon: "🏆",
                      title: "Priority Booking",
                      desc: "Reserve slots before anyone else",
                    },
                    {
                      icon: "📊",
                      title: "Personal Dashboard",
                      desc: "Track your exams, mocks & prep",
                    },
                    {
                      icon: "📚",
                      title: "Free Study Resources",
                      desc: "Tips, guides & material updates",
                    },
                  ].map((item, i) => (
                    <div key={i} className="ea-benefit-card">
                      <span className="ea-benefit-icon">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-dark-950 text-sm">
                          {item.title}
                        </h4>
                        <p className="text-dark-800/60 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ea-highlight-badge">
                  <Star size={14} fill="currentColor" /> Especially for CMA US &
                  CELPIP Candidates
                </div>
              </div>

              {/* RIGHT — Auth Card (Skeuomorphism) */}
              <div className="ea-auth-card animate-fade-in-up animation-delay-200">
                {/* Mode Toggle */}
                <div className="ea-mode-toggle">
                  <button
                    className={`ea-mode-btn ${authMode === "register" ? "ea-mode-btn--active" : ""}`}
                    onClick={() => {
                      setAuthMode("register");
                      setFormError("");
                      setFormSuccess(false);
                    }}
                  >
                    <User size={14} /> Register
                  </button>
                  <button
                    className={`ea-mode-btn ${authMode === "login" ? "ea-mode-btn--active" : ""}`}
                    onClick={() => {
                      setAuthMode("login");
                      setFormError("");
                      setFormSuccess(false);
                    }}
                  >
                    <LogIn size={14} /> Login
                  </button>
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="ea-icon-orb">
                    {authMode === "register" ? (
                      <Bell size={22} />
                    ) : (
                      <Lock size={22} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-dark-950">
                      {authMode === "register"
                        ? "Create Your Account"
                        : "Welcome Back"}
                    </h3>
                    <p className="text-xs text-dark-800/60">
                      {authMode === "register"
                        ? "Join 10,000+ candidates at FETS"
                        : "Login to your candidate dashboard"}
                    </p>
                  </div>
                </div>

                {/* Success state */}
                {formSuccess && (
                  <div className="ea-success-banner">
                    <CheckCircle2 size={20} />
                    <div>
                      <p className="font-bold text-sm">
                        Account Created Successfully! 🎉
                      </p>
                      <p className="text-xs opacity-80">
                        Redirecting to your dashboard...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {formError && (
                  <div className="ea-error-banner">
                    <X size={16} />
                    <p className="text-sm">{formError}</p>
                  </div>
                )}

                {/* Form */}
                {!formSuccess && (
                  <form
                    className="space-y-4"
                    onSubmit={
                      authMode === "register" ? handleRegister : handleLogin
                    }
                  >
                    {authMode === "register" && (
                      <>
                        <div>
                          <label className="ea-label">Full Name</label>
                          <div className="ea-input-wrapper">
                            <User size={15} className="ea-input-icon" />
                            <input
                              name="full_name"
                              type="text"
                              placeholder="Enter your full name"
                              className="ea-input"
                              value={formData.full_name}
                              onChange={handleFormChange}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="ea-label">Phone Number</label>
                          <div className="ea-input-wrapper">
                            <Phone size={15} className="ea-input-icon" />
                            <input
                              name="phone"
                              type="tel"
                              placeholder="+91 XXXXX XXXXX"
                              className="ea-input"
                              value={formData.phone}
                              onChange={handleFormChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="ea-label">Interested Exam</label>
                          <select
                            name="interested_exam"
                            className="ea-select"
                            value={formData.interested_exam}
                            onChange={handleFormChange}
                          >
                            <option value="">Select an exam</option>
                            <option value="CMA US">CMA US</option>
                            <option value="CELPIP">CELPIP</option>
                            <option value="IELTS">IELTS</option>
                            <option value="TOEFL">TOEFL</option>
                            <option value="GRE">GRE</option>
                            <option value="ACCA">ACCA</option>
                            <option value="Other">Other</option>
                          </select>
                          <p className="text-[10px] text-primary-600 mt-1 pl-1 flex items-center gap-1 font-semibold">
                            ✦ CMA US & CELPIP get priority notifications
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="ea-label">Email Address</label>
                      <div className="ea-input-wrapper">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ea-input-icon"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <input
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="ea-input"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="ea-label">
                        {authMode === "register"
                          ? "Create Password"
                          : "Password"}
                      </label>
                      <div className="ea-input-wrapper">
                        <Lock size={15} className="ea-input-icon" />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            authMode === "register"
                              ? "Min 6 characters"
                              : "Enter password"
                          }
                          className="ea-input"
                          value={formData.password}
                          onChange={handleFormChange}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="ea-input-toggle"
                        >
                          {showPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="ea-submit-btn"
                    >
                      {formLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />{" "}
                          Processing...
                        </>
                      ) : authMode === "register" ? (
                        <>Create Account & Get Early Access</>
                      ) : (
                        <>Login to Dashboard</>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-dark-800/50 pt-1 leading-relaxed px-4">
                      {authMode === "register"
                        ? "By registering, you agree to receive notifications about exam dates."
                        : "Forgot password? Contact us at mithun@fets.in"}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
            CERTIFIED TESTING PARTNERS — Moved to bottom
            ============================================= */}
        <section className="partners-shelf section-padding">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h4 className="text-overline mb-3">Certified Testing Partners</h4>
              <h2 className="heading-serif text-3xl md:text-4xl font-semibold text-dark-950">
                Authorized Testing Partner For
              </h2>
            </div>
            <div className="flex justify-center flex-wrap items-center gap-8 md:gap-14 lg:gap-16 bg-white/80 backdrop-blur-sm border border-light-300 rounded-[2rem] px-8 py-8 md:py-10 max-w-4xl mx-auto shadow-sm">
              <img
                src="/images/logos/prometric.png"
                alt="Prometric"
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-all duration-300"
              />
              <img
                src="/images/logos/pearson-vue.png"
                alt="Pearson VUE"
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-all duration-300"
              />
              <img
                src="/images/logos/celpip.jpg"
                alt="CELPIP"
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-all duration-300"
              />
              <img
                src="/images/logos/cma-usa.png"
                alt="CMA"
                className="h-12 md:h-16 object-contain opacity-70 hover:opacity-100 transition-all duration-300"
              />
              <img
                src="/images/logos/psi.png"
                alt="PSI"
                className="h-12 md:h-16 object-contain opacity-70 hover:opacity-100 transition-all duration-300"
              />
            </div>
            {/* Additional partner text badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                "IELTS",
                "TOEFL / GRE (ETS)",
                "ACCA",
                "AWS",
                "Cisco",
                "CompTIA",
                "Oracle",
                "Microsoft",
                "MRCS",
              ].map((name, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full bg-dark-950/5 border border-dark-950/10 text-dark-800 text-xs font-medium hover:text-primary-600 hover:border-primary-400/40 hover:bg-primary-400/5 transition-all cursor-default"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* CHAT OVERLAY */}
      {isChatOpen && (
        <AgentChatOverlay
          onClose={() => setIsChatOpen(false)}
          onOpenPanel={(panel) => setActivePanel(panel)}
        />
      )}

      {/* MOCK EXAM BOOKING MODAL */}
      {mockBookingModal && mockSelected && (
        mockSelected.name === "CMA US Mock Test" || mockSelected.name.includes("CMA US") ? (
          <CMAMockBookingModal 
             isOpen={mockBookingModal} 
             onClose={() => setMockBookingModal(false)}
             mockInfo={mockSelected} 
          />
        ) : (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-950/60 backdrop-blur-sm"
          onClick={() => setMockBookingModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-lg w-full relative border border-light-300 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-bold text-dark-950">
                Book Mock Exam
              </h3>
              <button
                onClick={() => setMockBookingModal(false)}
                className="fixed-close-btn p-2 bg-light-100 hover:bg-light-200 rounded-full text-dark-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {mockFormSuccess ? (
              <div className="py-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-dark-950 mb-2">
                  Request Received!
                </h4>
                <p className="text-dark-800/80">
                  Our team will contact you shortly to confirm your mock exam
                  slot.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 rounded-xl bg-primary-400/10 border border-primary-500/20 relative z-10">
                  <h4 className="text-primary-600 font-semibold">
                    {mockSelected.name}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-dark-800 font-medium">
                    <span>{mockSelected.duration}</span>
                    <span>{mockSelected.questions}</span>
                    <span className="text-dark-950 font-bold ml-auto">
                      ₹{mockSelected.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={handleBookMock}
                  className="space-y-4 relative z-10 text-left cursor-default"
                >
                  <div>
                    <label className="block text-sm font-bold text-dark-950 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={mockForm.name}
                      onChange={(e) =>
                        setMockForm({ ...mockForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-light-100 border border-light-300 text-dark-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark-950 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={mockForm.email}
                      onChange={(e) =>
                        setMockForm({ ...mockForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-light-100 border border-light-300 text-dark-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark-950 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mockForm.phone}
                      onChange={(e) =>
                        setMockForm({ ...mockForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-light-100 border border-light-300 text-dark-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark-950 mb-1.5">
                      Preferred Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={mockForm.date}
                      onChange={(e) =>
                        setMockForm({ ...mockForm, date: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-light-100 border border-light-300 text-dark-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium cursor-text"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={mockFormLoading}
                    className="w-full btn-nav mt-6 bg-[#FFD000] text-dark-950 border-transparent hover:bg-[#ffe44d] py-3.5 rounded-xl text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,208,0,0.25)] font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {mockFormLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Request Booking <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        )
      )}

      {/* LOCATION MODALS */}
      {activeLocationModal === "calicut" && (
=======
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
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
        <LocationModal
          title="Calicut Centre"
          address="Forun Testing & Educational Services<br/>4th Floor, Kadooli Tower<br/>West Nadakkavu, Vandipetta Junction<br/>Calicut, Kerala, India – 673011"
          phone="+91 495 491 5936"
          reach={{
<<<<<<< HEAD
            train: "Calicut Railway Station (Approx. 3 KM)",
            bus: "Calicut New Bus Stand (Approx. 4 KM)",
            air: "Calicut International Airport (CCJ) (Approx. 22 KM)",
=======
            train: 'Calicut Railway Station (Approx. 3 KM)',
            bus: 'Calicut New Bus Stand (Approx. 4 KM)',
            air: 'Calicut International Airport (CCJ) (Approx. 22 KM)',
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
          }}
          mapUrl="https://www.google.com/maps/dir//4th+Floor,+Forun+Educational+and+Testing+Services,+Kadooli+Tower+JN,+West+Nadakkave,+Vandipetta,+Bilathikkulam,+Kozhikode,+Kerala+673011"
          onClose={() => setActiveLocationModal(null)}
          onAskAi={() => {
            setActiveLocationModal(null);
            setIsChatOpen(true);
          }}
        />
      )}
<<<<<<< HEAD
      {activeLocationModal === "kochi" && (
=======
      {activeLocationModal === 'kochi' && (
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
        <LocationModal
          title="Kochi Centre"
          address="Forun Testing & Educational Services<br/>6th Floor, Manjooran Estate<br/>Behind MRA Hotel, Bypass Junction<br/>Edappally, Kochi, Kerala 682024"
          phone="+91 484 454 1957"
          reach={{
<<<<<<< HEAD
            train:
              "Ernakulam Town (ERN) – 6 KM | Ernakulam Junction (ERS) - 8.7 KM",
            metro: "Edapally Metro Station - 350 Meters",
            bus: "Kaloor Bus Stand - 5 KM | Vytilla Hub – 8.4 KM",
            air: "Cochin International Airport (COK) (Approx. 28 KM)",
=======
            train: 'Ernakulam Town (ERN) – 6 KM | Ernakulam Junction (ERS) - 8.7 KM',
            metro: 'Edapally Metro Station - 350 Meters',
            bus: 'Kaloor Bus Stand - 5 KM | Vytilla Hub – 8.4 KM',
            air: 'Cochin International Airport (COK) (Approx. 28 KM)',
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
          }}
          mapUrl="https://www.google.com/maps/dir//6th+Floor,+Manjooran+Estate,Bewhind+MRA+Hotel,+Bypass+Junction,+Edappally,+Kochi,+Kerala+682024"
          onClose={() => setActiveLocationModal(null)}
          onAskAi={() => {
            setActiveLocationModal(null);
            setIsChatOpen(true);
          }}
        />
      )}
<<<<<<< HEAD

      {/* SKEUOMORPHIC WORKFLOW MODAL FOR EXAM ASSIST */}
      {activePanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/70 backdrop-blur-md"
          onClick={() => setActivePanel(null)}
        >
          <div
            className="w-full max-w-md rounded-[28px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] border border-[#ffffff10]"
            style={{
              background: "linear-gradient(145deg, #16181b, #0d0f12)",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Area */}
            <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)] bg-dark-950 border border-white/5">
                  {activePanel === "exam-dates" && (
                    <CalendarIcon size={22} className="text-[#FFD000]" />
                  )}
                  {activePanel === "booking" && (
                    <ClipboardList size={22} className="text-[#FFD000]" />
                  )}
                  {activePanel === "contact" && (
                    <MapPin size={22} className="text-[#FFD000]" />
                  )}
                  {activePanel === "mock-exams" && (
                    <BookOpen size={22} className="text-[#FFD000]" />
                  )}
                  {!["exam-dates", "booking", "contact", "mock-exams"].includes(
                    activePanel,
                  ) && <ShieldCheck size={22} className="text-[#FFD000]" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white/95">
                    {activePanel === "exam-dates" && "Check Availability"}
                    {activePanel === "booking" && "Book Your Exam"}
                    {activePanel === "contact" && "Contact Support"}
                    {activePanel === "mock-exams" && "Mock Exams"}
                    {![
                      "exam-dates",
                      "booking",
                      "contact",
                      "mock-exams",
                    ].includes(activePanel) && "Exam Assist Action"}
                  </h3>
                  <p className="text-xs text-[#FFD000]/70 font-bold uppercase tracking-wider mt-0.5">
                    Secure Workflow Initiated
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] text-white/50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-6">
              {activePanel === "contact" ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-dark-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] border border-white/5">
                    <div className="flex items-start gap-4">
                      <Phone size={20} className="text-[#FFD000]/80 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white/90">
                          Call Us Anytime
                        </h4>
                        <p className="text-base text-[#FFD000] font-bold mt-1 tracking-wide">
                          +91 9605686000
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-dark-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] border border-white/5">
                    <div className="flex items-start gap-4">
                      <MapPin size={20} className="text-[#FFD000]/80 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white/90">
                          Calicut Centre
                        </h4>
                        <p className="text-sm text-white/60 mt-1 leading-relaxed">
                          First Floor, Rahmath Building, IG Road, Kerala
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePanel(null)}
                    className="w-full py-4 rounded-xl font-bold bg-[#FFD000] text-dark-950 shadow-[0_4px_15px_rgba(255,208,0,0.15),inset_0_2px_0_rgba(255,255,255,0.4)] hover:brightness-105 active:scale-[0.98] transition-all"
                  >
                    Return to Chat
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">
                    Our team provides personalized guidance for exam slots,
                    preparation, and booking. Let us know exactly what you need.
                  </p>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-white/40 mb-2 uppercase tracking-widest pl-1">
                        Your Requirement
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          activePanel === "exam-dates"
                            ? "Checking dates for..."
                            : activePanel === "mock-exams"
                              ? "Looking for mock tests in..."
                              : "Booking an exam..."
                        }
                        className="w-full px-5 py-3.5 rounded-xl bg-dark-950 border border-white/5 text-white/90 focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/50 outline-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] transition-all font-medium"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-white/40 mb-2 uppercase tracking-widest pl-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-5 py-3.5 rounded-xl bg-dark-950 border border-white/5 text-white/90 focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/50 outline-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(
                        "Our Exam Assist team has received your request. We will connect with you via WhatsApp/Call shortly!",
                      );
                      setActivePanel(null);
                    }}
                    className="w-full py-4 mt-2 rounded-xl font-bold text-sm bg-gradient-to-b from-white/10 to-white/5 border border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:from-white/[0.15] hover:to-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Send to Support Team{" "}
                    <ArrowRight size={16} className="text-[#FFD000]" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
=======
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
    </div>
  );
}

<<<<<<< HEAD
// Neural Orb inline (small version for buttons)
function NeuralOrbInline() {
  return (
    <span
      style={{
        display: "inline-flex",
        width: 18,
        height: 18,
        position: "relative",
        verticalAlign: "middle",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#FFD000",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 8px rgba(255, 208, 0, 0.6)",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: "50%",
          border: "1.5px solid rgba(255, 208, 0, 0.3)",
          borderTopColor: "transparent",
          animation: "orb-ring-spin 3s linear infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "50%",
          border: "1px solid rgba(255, 208, 0, 0.15)",
          borderBottomColor: "transparent",
          animation: "orb-ring-spin 5s linear infinite reverse",
        }}
      />
    </span>
  );
}

function LocationModal({
  title,
  address,
  phone,
  reach,
  mapUrl,
  onClose,
  onAskAi,
}) {
  return (
    <div
      className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative border border-light-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-light-100 hover:bg-light-200 rounded-full transition-colors text-dark-800 z-10"
        >
=======
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
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
          <X size={20} />
        </button>
        <div className="p-8">
          <div className="mb-8 flex items-center gap-3 border-b border-light-200 pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-400/20 text-primary-600">
              <MapPin size={24} />
            </div>
<<<<<<< HEAD
            <h2 className="heading-serif text-3xl md:text-4xl font-bold text-dark-950">
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left">
            <div>
              <h3 className="text-[10px] font-bold text-dark-800 uppercase tracking-widest mb-4">
                Address
              </h3>
              <p
                className="text-dark-950 font-medium leading-relaxed text-sm lg:text-base mb-6"
                dangerouslySetInnerHTML={{ __html: address }}
              ></p>

              <div className="flex items-center gap-3 text-primary-600 font-bold mb-8 bg-primary-400/10 p-3 rounded-lg w-max">
=======
            <h2 className="heading-serif text-3xl font-bold text-dark-950 md:text-4xl">{title}</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2 md:gap-12">
            <div>
              <h3 className="mb-4 text-[10px] font-bold tracking-widest text-dark-800 uppercase">Address</h3>
              <p className="mb-6 text-sm leading-relaxed font-medium text-dark-950 lg:text-base" dangerouslySetInnerHTML={{ __html: address }} />

              <div className="mb-8 flex w-max items-center gap-3 rounded-lg bg-primary-400/10 p-3 font-bold text-primary-600">
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
                <Phone size={18} /> {phone}
              </div>

              <div className="flex flex-col gap-3">
<<<<<<< HEAD
                <button
                  onClick={onAskAi}
                  className="btn-primary w-full flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group"
                >
                  <NeuralOrbInline /> Message via EXAM ASSIST
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white opacity-20 rounded-bl-full group-hover:scale-[3] transition-transform duration-500"></div>
                </button>
                <a
                  href="mailto:mithun@fets.in"
                  className="btn-secondary w-full flex items-center justify-center gap-2 border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Send Message Us
=======
                <button type="button" onClick={onAskAi} className="btn-primary group relative w-full overflow-hidden shadow-sm">
                  <Sparkles size={16} /> Message via EXAM ASSIST
                  <div className="absolute top-0 right-0 h-8 w-8 rounded-bl-full bg-white opacity-20 transition-transform duration-500 group-hover:scale-[3]" />
                </button>
                <a href="mailto:mithun@fets.in" className="btn-secondary flex w-full items-center justify-center gap-2 border-primary-500 text-primary-600 hover:bg-primary-50">
                  Email us
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
                </a>
              </div>
            </div>

<<<<<<< HEAD
            <div className="bg-light-100 p-6 rounded-xl border border-light-200">
              <h3 className="text-[10px] font-bold text-dark-800 uppercase tracking-widest mb-5">
                How to Reach Us
              </h3>
              <ul className="space-y-5 text-sm">
                {reach.train && (
                  <li>
                    <strong className="block text-dark-950 mb-1 lg:text-base">
                      By Train:
                    </strong>
                    <span className="text-dark-800 leading-snug block">
                      {reach.train}
                    </span>
=======
            <div className="rounded-xl border border-light-200 bg-light-100 p-6">
              <h3 className="mb-5 text-[10px] font-bold tracking-widest text-dark-800 uppercase">How to reach us</h3>
              <ul className="space-y-5 text-sm">
                {reach.train && (
                  <li>
                    <strong className="mb-1 block text-dark-950 lg:text-base">By train</strong>
                    <span className="block leading-snug text-dark-800">{reach.train}</span>
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
                  </li>
                )}
                {reach.metro && (
                  <li>
<<<<<<< HEAD
                    <strong className="block text-dark-950 mb-1 lg:text-base">
                      By Metro:
                    </strong>
                    <span className="text-dark-800 leading-snug block">
                      {reach.metro}
                    </span>
=======
                    <strong className="mb-1 block text-dark-950 lg:text-base">By metro</strong>
                    <span className="block leading-snug text-dark-800">{reach.metro}</span>
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
                  </li>
                )}
                {reach.bus && (
                  <li>
<<<<<<< HEAD
                    <strong className="block text-dark-950 mb-1 lg:text-base">
                      By Bus:
                    </strong>
                    <span className="text-dark-800 leading-snug block">
                      {reach.bus}
                    </span>
=======
                    <strong className="mb-1 block text-dark-950 lg:text-base">By bus</strong>
                    <span className="block leading-snug text-dark-800">{reach.bus}</span>
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
                  </li>
                )}
                {reach.air && (
                  <li>
<<<<<<< HEAD
                    <strong className="block text-dark-950 mb-1 lg:text-base">
                      By Air:
                    </strong>
                    <span className="text-dark-800 leading-snug block">
                      {reach.air}
                    </span>
=======
                    <strong className="mb-1 block text-dark-950 lg:text-base">By air</strong>
                    <span className="block leading-snug text-dark-800">{reach.air}</span>
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
                  </li>
                )}
              </ul>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
<<<<<<< HEAD
                className="mt-8 block w-full bg-dark-950 text-primary-400 font-bold py-3.5 rounded hover:bg-dark-900 transition-colors text-sm shadow-md flex items-center justify-center gap-2 border border-dark-950"
=======
                className="mt-8 flex w-full items-center justify-center gap-2 rounded border border-dark-950 bg-dark-950 py-3.5 text-sm font-bold text-primary-400 shadow-md hover:bg-dark-900"
>>>>>>> 3d02be90a59f0be113a2af5b940111a978ed7ca4
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
