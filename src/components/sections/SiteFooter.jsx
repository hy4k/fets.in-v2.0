import { MapPin, Phone, Mail } from 'lucide-react';
import { centers } from '../../data/siteData';

const LINKS = [
  { href: '#mock-exams', label: 'Mock exams' },
  { href: '#calendar', label: 'Calendar' },
  { href: '#student-resources', label: 'Resources' },
  { href: '#faq', label: 'FAQ' },
  { href: '#early-access', label: 'Updates' },
];

const PARTNERS = [
  { src: '/images/logos/prometric.png', alt: 'Prometric', h: 'h-9 md:h-11' },
  { src: '/images/logos/pearson-vue.png', alt: 'Pearson VUE', h: 'h-9 md:h-11' },
  { src: '/images/logos/celpip.jpg', alt: 'CELPIP', h: 'h-10 md:h-12' },
  { src: '/images/logos/cma-usa.png', alt: 'CMA USA', h: 'h-11 md:h-14' },
  { src: '/images/logos/psi.png', alt: 'PSI', h: 'h-11 md:h-14' },
];

const PARTNER_BADGES = ['IELTS', 'TOEFL / GRE (ETS)', 'ACCA', 'AWS', 'Cisco', 'CompTIA', 'Oracle', 'Microsoft', 'MRCS'];

export default function SiteFooter({ onOpenCalicut, onOpenKochi }) {
  return (
    <>
      {/* Partners shelf */}
      <section className="border-t border-white/[0.06] bg-[#0a0a0a] section-padding">
        <div className="container-custom">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-3">Certified Testing Partners</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-normal">
              Authorized Testing Partner For
            </h2>
          </div>

          {/* Color logos — no grayscale/invert */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 border border-white/[0.08] bg-white/[0.03] rounded-[2rem] px-8 py-8 md:py-10 max-w-4xl mx-auto">
            {PARTNERS.map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className={`${p.h} object-contain opacity-75 hover:opacity-100 transition-opacity duration-300`}
              />
            ))}
          </div>

          {/* Text badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {PARTNER_BADGES.map((name) => (
              <span
                key={name}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold hover:text-[#FFD000] hover:border-[#FFD000]/20 transition-all cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main footer */}
      <footer className="border-t border-light-300 bg-dark-950 text-light-200">
        <div className="container-custom section-padding !pb-12 !pt-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="heading-serif text-xl font-semibold text-white">FETS</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Forun Testing & Educational Services — premier certification testing in Kozhikode and Kochi, with mocks and student resources to support your exam journey.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-400">Explore</h3>
              <ul className="space-y-2">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-400">Centres</h3>
              <ul className="space-y-3">
                <li>
                  <button type="button" onClick={onOpenCalicut} className="flex items-start gap-2 text-left text-sm text-zinc-400 transition-colors hover:text-white">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-accent-400" />
                    Calicut — Kadooli Tower
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenKochi} className="flex items-start gap-2 text-left text-sm text-zinc-400 transition-colors hover:text-white">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-accent-400" />
                    Kochi — Edappally
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-400">Contact</h3>
              <a href="tel:+919605686000" className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Phone size={16} className="text-primary-400" /> +91 9605686000
              </a>
              <a href="mailto:edu@fets.in" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
                <Mail size={16} /> edu@fets.in
              </a>
              <div className="mt-4 space-y-1 text-xs text-zinc-500">
                {centers.map((c) => (
                  <p key={c.id}>
                    <span className="text-zinc-400">{c.name.split(' ')[0]}:</span> {c.phone}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} Forun Testing & Educational Services. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
