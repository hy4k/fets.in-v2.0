import { Compass } from 'lucide-react';

export default function NavigatorAvatar({ isThinking = false }) {
  return (
    <div className={`navigator-container ${isThinking ? 'navigator-thinking' : ''}`}>
      <div className="nav-glow" />
      <svg className="nav-svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <linearGradient id="rg1" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F26076" /><stop offset="1" stopColor="#FF9760" />
          </linearGradient>
          <linearGradient id="rg2" x1="0" y1="120" x2="120" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9760" /><stop offset="1" stopColor="#FFD150" />
          </linearGradient>
          <linearGradient id="rg3" x1="120" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD150" /><stop offset="1" stopColor="#458B73" />
          </linearGradient>
          <radialGradient id="cg" cx="60" cy="60" r="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F26076" /><stop offset="1" stopColor="#c94d60" />
          </radialGradient>
        </defs>

        {/* Ring 3 — outermost */}
        <g className="nav-ring-group nav-ring-group-3">
          <circle cx="60" cy="60" r="54" stroke="url(#rg3)" strokeWidth="1.2" strokeDasharray="7 5" opacity="0.5" />
          <circle cx="60" cy="6" r="3" fill="#458B73" opacity="0.9" />
          <circle cx="114" cy="60" r="2" fill="#6fb99b" opacity="0.6" />
        </g>

        {/* Ring 2 */}
        <g className="nav-ring-group nav-ring-group-2">
          <circle cx="60" cy="60" r="40" stroke="url(#rg2)" strokeWidth="1.4" strokeDasharray="5 7" opacity="0.6" />
          <circle cx="60" cy="20" r="3.5" fill="#FF9760" opacity="0.9" />
          <circle cx="20" cy="60" r="2.5" fill="#FFD150" opacity="0.6" />
        </g>

        {/* Ring 1 — innermost */}
        <g className="nav-ring-group nav-ring-group-1">
          <circle cx="60" cy="60" r="28" stroke="url(#rg1)" strokeWidth="1.8" strokeDasharray="4 5" opacity="0.7" />
          <circle cx="60" cy="32" r="4" fill="#F26076" opacity="0.9" />
        </g>

        {/* Core */}
        <g className="nav-core">
          <circle cx="60" cy="60" r="16" fill="url(#cg)" opacity="0.85" />
          {/* Compass diamond */}
          <path d="M60 48 L66 60 L60 72 L54 60 Z" fill="white" opacity="0.85" />
          <path d="M60 48 L66 60 L60 52 L54 60 Z" fill="white" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
