import { useState } from 'react';
import { Menu, X, MapPin, LogIn } from 'lucide-react';

const NAV_MOBILE = [
  { href: '#mock-exams', label: 'Exam Test Drive' },
  { href: '#register', label: 'Early Access' },
  { href: '#faq', label: 'FAQ' },
];

function AiWaveIcon({ size = 20 }) {
  return (
    <svg width={size} height={Math.round(size * 0.82)} viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="3" height="6" rx="1.5" fill="currentColor" style={{ animation: 'navWave1 1.2s ease-in-out infinite' }} />
      <rect x="4.75" y="2" width="3" height="14" rx="1.5" fill="currentColor" style={{ animation: 'navWave2 1.2s ease-in-out 0.15s infinite' }} />
      <rect x="9.5" y="0" width="3" height="18" rx="1.5" fill="currentColor" style={{ animation: 'navWave3 1.2s ease-in-out 0.3s infinite' }} />
      <rect x="14.25" y="2" width="3" height="14" rx="1.5" fill="currentColor" style={{ animation: 'navWave2 1.2s ease-in-out 0.45s infinite' }} />
      <rect x="19" y="6" width="3" height="6" rx="1.5" fill="currentColor" style={{ animation: 'navWave1 1.2s ease-in-out 0.6s infinite' }} />
    </svg>
  );
}

export default function SiteHeader({ onOpenChat, onOpenCalicut, onOpenKochi, onOpenLogin, user, onOpenDashboard }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || null;

  return (
    <>
      <style>{`
        @keyframes navWave1 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.4)} }
        @keyframes navWave2 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.5)} }
        @keyframes navWave3 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.3)} }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="container-custom flex h-16 md:h-20 items-center justify-between gap-3">

          {/* Mobile hamburger */}
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden flex-wrap items-center justify-between w-full lg:flex" aria-label="Primary">

            {/* Left: Locations */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onOpenCalicut}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#FFD000]/30 bg-[#FFD000]/8 text-white text-sm font-bold hover:bg-[#FFD000]/15 hover:border-[#FFD000]/50 transition-all group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD000] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD000]"></span>
                </span>
                <MapPin size={13} className="text-[#FFD000] group-hover:scale-110 transition-transform" />
                Calicut
              </button>
              <button
                type="button"
                onClick={onOpenKochi}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#FFD000]/30 bg-[#FFD000]/8 text-white text-sm font-bold hover:bg-[#FFD000]/15 hover:border-[#FFD000]/50 transition-all group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD000] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD000]"></span>
                </span>
                <MapPin size={13} className="text-[#FFD000] group-hover:scale-110 transition-transform" />
                Kochi
              </button>
            </div>

            {/* Centre: Exam Test Drive */}
            <div className="flex gap-2">
              <a
                href="#mock-exams"
                className="inline-flex items-center h-10 px-5 rounded-lg bg-[#FFD000] text-[#0a0a0a] text-sm font-black hover:bg-[#ffe44d] transition-all shadow-[0_4px_16px_rgba(255,208,0,0.2)]"
              >
                Exam Test Drive
              </a>
            </div>

            {/* Right: Early Access + Login/User */}
            <div className="flex items-center gap-2">
              <a
                href="#register"
                className="inline-flex items-center h-10 px-5 rounded-lg bg-[#FFD000] text-[#0a0a0a] text-sm font-black hover:bg-[#ffe44d] transition-all shadow-[0_4px_16px_rgba(255,208,0,0.2)]"
              >
                Early Access
              </a>

              {user ? (
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="flex h-10 items-center gap-2 px-4 rounded-lg bg-[#FFD000] text-[#0a0a0a] text-sm font-black hover:bg-[#ffe44d] transition-all shadow-[0_4px_16px_rgba(255,208,0,0.2)]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0a0a0a]/20 flex items-center justify-center text-[10px] font-black">
                    {firstName?.charAt(0).toUpperCase()}
                  </div>
                  {firstName}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex h-10 items-center gap-2 px-5 rounded-lg bg-[#FFD000] text-[#0a0a0a] text-sm font-black hover:bg-[#ffe44d] transition-all shadow-[0_4px_16px_rgba(255,208,0,0.2)]"
                >
                  <LogIn size={15} /> Login
                </button>
              )}
            </div>
          </nav>

          {/* Mobile: AI + Phone */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenChat}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#FFD000]"
              aria-label="Ask AI"
            >
              <AiWaveIcon size={18} />
            </button>
            {user ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#FFD000]/30 bg-[#FFD000]/10 text-[#FFD000] font-black text-sm"
                aria-label="Dashboard"
              >
                {firstName?.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70"
                aria-label="Login"
              >
                <LogIn size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      {open && (
        <>
          <div className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm" aria-hidden onClick={close} />
          <div
            id="mobile-nav"
            className="fixed top-0 left-0 z-[46] h-full w-72 bg-[#0f0f0f] border-r border-white/10 p-5 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-black text-white text-lg">FETS</span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60"
                onClick={close}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 hover:text-white"
                onClick={() => { onOpenCalicut(); close(); }}
              >
                <MapPin size={15} className="text-[#FFD000]" /> Calicut centre
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 hover:text-white"
                onClick={() => { onOpenKochi(); close(); }}
              >
                <MapPin size={15} className="text-[#FFD000]" /> Kochi centre
              </button>
              {NAV_MOBILE.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white"
                  onClick={close}
                >
                  {item.label}
                </a>
              ))}
              {user ? (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-[#FFD000]/20 bg-[#FFD000]/10 px-4 py-3 text-sm font-black text-[#FFD000]"
                  onClick={() => { onOpenDashboard(); close(); }}
                >
                  My Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white"
                  onClick={() => { onOpenLogin(); close(); }}
                >
                  <LogIn size={15} /> Login
                </button>
              )}
              <a
                href="tel:+919605686000"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#FFD000] py-3 text-sm font-black text-[#0a0a0a]"
                onClick={close}
              >
                <Phone size={16} /> Call +91 9605686000
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
