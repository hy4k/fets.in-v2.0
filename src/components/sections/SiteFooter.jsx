import { MapPin, Phone, Mail } from 'lucide-react';
import { centers } from '../../data/siteData';

const LINKS = [
  { href: '#mock-exams', label: 'Mock exams' },
  { href: '#calendar', label: 'Calendar' },
  { href: '#student-resources', label: 'Resources' },
  { href: '#faq', label: 'FAQ' },
  { href: '#early-access', label: 'Updates' },
];

export default function SiteFooter({ onOpenCalicut, onOpenKochi }) {
  return (
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
  );
}
