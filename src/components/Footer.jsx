import {
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  ArrowRight,
} from "lucide-react";

const quickLinks = [
  { label: "Exams & Availability", href: "#early-access" },
  { label: "Mock Exams", href: "#mock-exams" },
  { label: "Contact Us", href: "mailto:contact@fets.in" },
  { label: "Agent Portal", href: "#agent-portal" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#0b0c10] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-[#FFD000]/30 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFD000]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-20 relative z-10">
        {/* Top Section: CTA & Brand */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 border-b border-white/10 pb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              FORUN EDUCATIONAL <br />
              <span className="text-[#FFD000]">&amp; TESTING SERVICES</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl">
              Kerala's premier authorized testing center, delivering world-class
              examination environments for global certifications.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#early-access"
                className="px-8 py-4 rounded-xl font-bold bg-[#FFD000] text-dark-950 shadow-[0_4px_20px_rgba(255,208,0,0.15)] hover:bg-[#ffe44d] transition-all flex items-center gap-2 group"
              >
                Book Your Exam{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="tel:+919605686000"
                className="px-8 py-4 rounded-xl font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Phone size={18} className="text-[#FFD000]" /> Contact Support
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 lg:gap-20">
            <div>
              <h4 className="text-white font-bold text-lg mb-6 tracking-wide">
                Quick Links
              </h4>
              <ul className="space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-white/50 hover:text-[#FFD000] transition-colors font-medium flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#FFD000] transition-colors"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-6 tracking-wide">
                Popular Tests
              </h4>
              <ul className="space-y-4">
                {["CMA US", "CELPIP", "IELTS", "Prometric Exams"].map(
                  (exam) => (
                    <li key={exam}>
                      <a
                        href="#early-access"
                        className="text-white/50 hover:text-[#FFD000] transition-colors font-medium flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#FFD000] transition-colors"></span>
                        {exam}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Section: Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-dark-950 border border-white/5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD000]/10 flex items-center justify-center mb-6">
              <MapPin size={24} className="text-[#FFD000]" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              Calicut Centre
            </h4>
            <p className="text-white/50 font-medium leading-relaxed mb-6">
              4th Floor, Kadooli Tower,
              <br />
              West Nadakkavu, Vandipetta Junction,
              <br />
              Calicut, Kerala – 673011
            </p>
            <div className="space-y-3 pt-4 border-t border-white/5">
              <a
                href="tel:04954915936"
                className="text-white/70 hover:text-[#FFD000] transition-colors flex items-center gap-3 font-semibold"
              >
                <Phone size={16} className="text-[#FFD000]" /> 0495 4915936
              </a>
              <a
                href="mailto:contact@fets.in"
                className="text-white/70 hover:text-[#FFD000] transition-colors flex items-center gap-3 font-semibold"
              >
                <Mail size={16} className="text-[#FFD000]" /> contact@fets.in
              </a>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-dark-950 border border-white/5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD000]/10 flex items-center justify-center mb-6">
              <MapPin size={24} className="text-[#FFD000]" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Kochi Centre</h4>
            <p className="text-white/50 font-medium leading-relaxed mb-6">
              6th Floor, Manjooran Estate,
              <br />
              Behind MRA Hotel, Bypass Junction,
              <br />
              Edappally, Kochi, Kerala – 682024
            </p>
            <div className="space-y-3 pt-4 border-t border-white/5">
              <a
                href="tel:04844541957"
                className="text-white/70 hover:text-[#FFD000] transition-colors flex items-center gap-3 font-semibold"
              >
                <Phone size={16} className="text-[#FFD000]" /> 0484 4541957
              </a>
              <a
                href="mailto:contact@fets.in"
                className="text-white/70 hover:text-[#FFD000] transition-colors flex items-center gap-3 font-semibold"
              >
                <Mail size={16} className="text-[#FFD000]" /> contact@fets.in
              </a>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#FFD000] flex flex-col justify-between">
            <div>
              <h4 className="text-2xl font-black text-dark-950 mb-4">
                Partner With Us
              </h4>
              <p className="text-dark-900/80 font-medium leading-relaxed mb-6">
                Are you a test sponsor, academic institution, or corporate
                entity? Let's collaborate to deliver seamless examinations.
              </p>
            </div>
            <a
              href="mailto:mithun@fets.in"
              className="w-full py-4 rounded-xl font-bold bg-dark-950 text-white shadow-xl hover:bg-dark-900 transition-all flex items-center justify-center gap-2"
            >
              Get in Touch <ArrowRight size={18} className="text-[#FFD000]" />
            </a>
          </div>
        </div>

        {/* Bottom Section: Legal & Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
          <p className="text-white/40 text-sm font-medium">
            &copy; {new Date().getFullYear()} FORUN EDUCATIONAL & TESTING
            SERVICES. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-bold text-white/50 hover:text-[#FFD000] transition-colors text-xs uppercase tracking-widest"
            >
              Instagram
            </a>
            <a
              href="#"
              className="font-bold text-white/50 hover:text-[#FFD000] transition-colors text-xs uppercase tracking-widest"
            >
              Facebook
            </a>
            <a
              href="#"
              className="font-bold text-white/50 hover:text-[#FFD000] transition-colors text-xs uppercase tracking-widest"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="font-bold text-white/50 hover:text-[#FFD000] transition-colors text-xs uppercase tracking-widest"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
