import { useState, useEffect } from 'react';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Exam Dates', href: '#exam-dates' },
  { label: 'Book Exam', href: '#book-exam' },
  { label: 'Mock Exams', href: '#mock-exams' },
  { label: 'Register', href: '#register' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy-950/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <img 
              src="/images/logos/forun-logo.png" 
              alt="Forun Educational & Testing Services" 
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === link.href.slice(1)
                    ? 'text-gold-400 bg-gold-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Phone */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+919605686000" className="flex items-center gap-2 text-gray-300 hover:text-gold-400 transition-colors text-sm">
              <Phone size={16} />
              <span>+91 9605686000</span>
            </a>
            <a
              href="#book-exam"
              className="btn-premium px-6 py-2.5 rounded-xl text-sm"
            >
              Book an Exam
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy-950/98 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  activeSection === link.href.slice(1)
                    ? 'text-gold-400 bg-gold-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-white/10">
              <a href="tel:+919605686000" className="flex items-center gap-2 text-gray-300 px-4 text-sm">
                <Phone size={16} className="text-gold-400" />
                +91 9605686000
              </a>
              <a href="#book-exam" onClick={() => setMobileOpen(false)} className="block btn-premium text-center px-6 py-3 rounded-xl text-base">
                Book an Exam
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
