import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, BookOpen, Bell, ChevronDown, Shield, Award, MapPin } from 'lucide-react';

const highlights = [
  { icon: Shield, text: 'Prometric & Pearson VUE Authorized' },
  { icon: Award, text: 'Since 2019' },
  { icon: MapPin, text: 'Calicut & Kochi, Kerala' },
];

const partners = [
  { name: 'Prometric', logo: '/images/logos/prometric.png' },
  { name: 'Pearson VUE', logo: '/images/logos/pearson-vue.png' },
  { name: 'CELPIP', logo: '/images/logos/celpip.jpg' },
  { name: 'CMA USA', logo: '/images/logos/cma-usa.png' },
  { name: 'PSI', logo: '/images/logos/psi.png' },
  { name: 'MRCS', logo: '/images/logos/rcs.png' },
  { name: 'Microsoft', logo: '/images/logos/microsoft.png' },
];

const words = ['CMA US', 'CELPIP', 'IELTS', 'TOEFL', 'AWS', 'MRCS'];

export default function Hero() {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #011e26 0%, #012e3d 25%, #013a4e 50%, #01293a 75%, #071a27 100%)' }}>
        {/* Gradient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(3,174,210,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(3,174,210,0.4) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial gradient spotlight */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(3,174,210,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent, #071a27)' }} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center flex-1 flex flex-col justify-center">
        {/* Brand Name */}
        <div className="flex justify-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-wide text-[#FFD700] drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)' }}>
            FORUN EDUCATIONAL & TESTING SERVICES
          </h2>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-navy-400/10 border border-navy-400/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-navy-300 text-sm font-medium">Kerala's Premier Testing Center</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Your Gateway to</span>
          <br />
          <span className="gradient-text font-serif">Global Certifications</span>
        </h1>

        {/* Rotating exam text */}
        <div className="text-xl sm:text-2xl text-gray-300 mb-4 h-10">
          Now preparing candidates for{' '}
          <span className="text-gold-400 font-semibold inline-block min-w-[120px] transition-all duration-500">
            {words[currentWord]}
          </span>
        </div>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          Experience world-class testing facilities in Kerala. Check exam dates, register for exclusive early access,
          book your slot, and practice with mock exams — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <a
            href="#exam-dates"
            className="btn-premium px-8 py-4 rounded-2xl text-base flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Calendar size={20} />
            Check Exam Dates
            <ArrowRight size={18} />
          </a>
          <a
            href="#register"
            className="btn-outline-premium px-8 py-4 rounded-2xl text-base flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Bell size={20} />
            Get Early Access
          </a>
          <a
            href="#mock-exams"
            className="px-8 py-4 rounded-2xl text-base flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all w-full sm:w-auto justify-center backdrop-blur-sm"
          >
            <BookOpen size={20} />
            Mock Exams
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-16">
          {highlights.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-400">
              <item.icon size={18} className="text-navy-400" />
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PARTNER LOGOS (integrated into hero) ===== */}
      <div className="relative z-10 pb-12">
        <p className="text-center text-xs text-gray-500 uppercase tracking-[0.25em] mb-6 font-medium">
          Authorized Testing Partner For
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:gap-14 max-w-5xl mx-auto px-4">
          {partners.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300"
              title={p.name}
            >
              <img
                src={p.logo}
                alt={p.name}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown size={24} className="text-navy-400/50" />
      </div>
    </section>
  );
}
