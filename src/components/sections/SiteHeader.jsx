import { useState } from 'react';
import { Menu, X, MapPin, Phone, Sparkles } from 'lucide-react';

const NAV = [
  { href: '#mock-exams', label: 'Mock exams' },
  { href: '#calendar', label: 'Calendar' },
  { href: '#student-resources', label: 'Student resources' },
  { href: '#faq', label: 'FAQ' },
  { href: '#early-access', label: 'Updates' },
];

export default function SiteHeader({ onOpenChat, onOpenCalicut, onOpenKochi }) {
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

          <nav className="hidden flex-wrap items-center justify-between font-semibold text-sm w-full ml-6 lg:flex" aria-label="Primary">
            {/* Left: Locations */}
            <div className="flex gap-3">
              <button type="button" onClick={() => { onOpenCalicut(); }} className="btn-nav text-[16px] h-12 px-6 shadow-sm gap-2">
                <MapPin size={18} /> Calicut
              </button>
              <button type="button" onClick={() => { onOpenKochi(); }} className="btn-nav text-[16px] h-12 px-6 shadow-sm gap-2">
                <MapPin size={18} /> Kochi
              </button>
            </div>

            {/* Middle: Links */}
            <div className="flex gap-4">
              <a href="#calendar" className="btn-nav text-[16px] h-12 px-6 shadow-sm bg-transparent border-0 hover:bg-light-200 shadow-none">
                Check Availability
              </a>
              <a href="#early-access" className="btn-nav text-[16px] h-12 px-6 shadow-sm bg-transparent border-0 hover:bg-light-200 shadow-none">
                Early Access
              </a>
            </div>

            {/* Right: Mock Exam & AI/Contact Icons */}
            <div className="flex items-center gap-4">
              <a href="#mock-exams" className="btn-nav text-[16px] h-12 px-6 shadow-sm !bg-dark-900 !text-[#FFD000] hover:!bg-dark-800 border-0">
                Mock Exams
              </a>
              <div className="flex gap-2">
                <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-400 text-dark-950 shadow-sm transition-transform hover:scale-105" onClick={() => onOpenChat()}>
                  <Sparkles size={20} />
                </button>
                <a href="tel:+919605686000" className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-300 text-dark-950 transition-colors hover:bg-light-400">
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => onOpenChat()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-400 text-dark-900"
            >
              <Sparkles size={20} />
            </button>
            <a
              href="tel:+919605686000"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-light-300 bg-white text-dark-900"
              aria-label="Call FETS"
            >
              <Phone size={20} />
            </a>
          </div>
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
