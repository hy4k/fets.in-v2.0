import { useState } from 'react';
import { Menu, X, MapPin, Phone } from 'lucide-react';

const NAV = [
  { href: '#mock-exams', label: 'Mock exams' },
  { href: '#calendar', label: 'Calendar' },
  { href: '#student-resources', label: 'Student resources' },
  { href: '#faq', label: 'FAQ' },
  { href: '#early-access', label: 'Updates' },
];

export default function SiteHeader({ onOpenCalicut, onOpenKochi }) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-light-300 bg-light-50/95 backdrop-blur-md shadow-sm">
        <div className="container-custom flex h-16 md:h-20 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-light-300 bg-white text-dark-900 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} strokeWidth={2} />
            </button>
            <a
              href="#top"
              className="truncate font-bold tracking-tight text-dark-950"
              onClick={close}
            >
              FETS
            </a>
          </div>

          <nav className="hidden flex-wrap items-center justify-center gap-2 font-semibold text-sm md:flex lg:gap-3" aria-label="Primary">
            <button type="button" onClick={() => { onOpenCalicut(); }} className="btn-nav gap-1">
              <MapPin size={14} /> Calicut
            </button>
            <button type="button" onClick={() => { onOpenKochi(); }} className="btn-nav gap-1">
              <MapPin size={14} /> Kochi
            </button>
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="btn-nav">
                {item.label}
              </a>
            ))}
            <a href="tel:+919605686000" className="btn-nav gap-1 lg:ml-auto">
              <Phone size={14} /> +91 9605686000
            </a>
          </nav>

          <a
            href="tel:+919605686000"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-light-300 bg-white text-dark-900 md:hidden"
            aria-label="Call FETS"
          >
            <Phone size={20} />
          </a>
        </div>
      </header>

      {open && (
        <>
          <div className="nav-sheet-backdrop" aria-hidden onClick={close} />
          <div id="mobile-nav" className="nav-sheet" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="mb-4 flex items-center justify-between border-b border-light-300 pb-3">
              <span className="font-bold text-dark-950">Menu</span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-light-300 bg-light-100"
                onClick={close}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" className="rounded-lg border border-light-300 bg-white px-4 py-3 text-left font-semibold text-dark-900" onClick={() => { onOpenCalicut(); close(); }}>
                <MapPin className="mr-2 inline" size={16} /> Calicut centre
              </button>
              <button type="button" className="rounded-lg border border-light-300 bg-white px-4 py-3 text-left font-semibold text-dark-900" onClick={() => { onOpenKochi(); close(); }}>
                <MapPin className="mr-2 inline" size={16} /> Kochi centre
              </button>
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="rounded-lg border border-light-300 bg-white px-4 py-3 font-semibold text-dark-900" onClick={close}>
                  {item.label}
                </a>
              ))}
              <a href="tel:+919605686000" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-dark-950 py-3 font-bold text-primary-400" onClick={close}>
                <Phone size={18} /> Call +91 9605686000
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
