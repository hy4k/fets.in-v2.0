import { Phone, Mail, MapPin, ArrowUp } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Exam Dates', href: '#exam-dates' },
  { label: 'Book Exam', href: '#book-exam' },
  { label: 'Mock Exams', href: '#mock-exams' },
  { label: 'Register', href: '#register' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

const exams = [
  'CMA US', 'CELPIP', 'IELTS', 'TOEFL iBT', 'GRE', 'ACCA', 'MRCS', 'AWS', 'Microsoft',
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-5">
              <img
                src="/images/logos/forun-logo.png"
                alt="Forun Educational & Testing Services"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Forun Testing & Educational Services — Kerala's premier testing center providing world-class examination facilities since 2019.
            </p>
            <div className="space-y-2.5">
              <a href="tel:+919605686000" className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors text-sm">
                <Phone size={14} /> +91 9605686000
              </a>
              <a href="mailto:edu@fets.in" className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors text-sm">
                <Mail size={14} /> edu@fets.in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="text-white font-semibold mb-4">Exams We Offer</h4>
            <ul className="space-y-2">
              {exams.map((exam) => (
                <li key={exam}>
                  <a href="#exam-dates" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                    {exam}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-white font-semibold mb-4">Our Locations</h4>
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-gold-400 text-sm font-medium mb-1">
                  <MapPin size={14} /> Calicut
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-1">
                  4th Floor, Kadooli Tower, West Nadakkavu, Vandipetta Junction, Calicut 673011
                </p>
                <a href="tel:04954915936" className="text-gray-500 text-xs hover:text-gold-400 transition-colors flex items-center gap-1">
                  <Phone size={10} /> 0495 4915936
                </a>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gold-400 text-sm font-medium mb-1">
                  <MapPin size={14} /> Kochi
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-1">
                  6th Floor, Manjooran Estate, Behind MRA Hotel, Bypass Junction, Edappally, Kochi 682024
                </p>
                <a href="tel:04844541957" className="text-gray-500 text-xs hover:text-gold-400 transition-colors flex items-center gap-1">
                  <Phone size={10} /> 0484 4541957
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Partner logos strip */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 opacity-40">
            {[
              { src: '/images/logos/prometric.png', alt: 'Prometric' },
              { src: '/images/logos/pearson-vue.png', alt: 'Pearson VUE' },
              { src: '/images/logos/celpip.jpg', alt: 'CELPIP' },
              { src: '/images/logos/cma-usa.png', alt: 'CMA USA' },
              { src: '/images/logos/microsoft.png', alt: 'Microsoft' },
              { src: '/images/logos/psi.png', alt: 'PSI' },
            ].map((logo, i) => (
              <img key={i} src={logo.src} alt={logo.alt} className="h-6 w-auto object-contain grayscale invert" />
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} FETS - Forun Testing and Educational Services. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/30 hover:text-gold-400 text-gray-400 transition-all"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
