import { Sparkles } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="top-bar">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img
          src="/images/logos/forun-logo.png"
          alt="FETS"
          className="h-7 w-auto object-contain brightness-0 invert opacity-80"
        />
      </div>

      {/* Agent Status */}
      <div className="flex items-center gap-2">
        <div className="status-dot" />
        <span className="text-sm font-medium text-zinc-400 hidden sm:inline">FETS AI is online</span>
        <Sparkles size={14} className="text-rose-400" />
      </div>

      {/* Right */}
      <a
        href="tel:+919605686000"
        className="text-xs font-medium text-zinc-500 hover:text-rose-400 transition-colors hidden sm:flex items-center gap-1.5"
      >
        +91 9605686000
      </a>
    </div>
  );
}
