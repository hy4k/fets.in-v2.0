import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import AgentAvatar from './AgentAvatar';

const partners = [
  { name: 'Prometric', logo: '/images/logos/prometric.png' },
  { name: 'Pearson VUE', logo: '/images/logos/pearson-vue.png' },
  { name: 'CELPIP', logo: '/images/logos/celpip.jpg' },
  { name: 'CMA USA', logo: '/images/logos/cma-usa.png' },
  { name: 'PSI', logo: '/images/logos/psi.png' },
  { name: 'MRCS', logo: '/images/logos/rcs.png' },
];

export default function EntryScreen({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 800);
  };

  return (
    <div className={`entry-screen ${exiting ? 'exit' : ''}`}>
      {/* Background orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-2xl">
        {/* Logo */}
        <div className="entry-logo mb-4">
          <img
            src="/images/logos/forun-logo.png"
            alt="FETS"
            className="h-12 sm:h-14 w-auto object-contain brightness-0 invert"
          />
        </div>

        {/* Avatar */}
        <div className="entry-tagline mb-8">
          <AgentAvatar size="lg" />
        </div>

        {/* Headline */}
        <h1 className="entry-subtitle text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
          <span className="text-white">Meet Your </span>
          <span className="gradient-text-warm font-serif italic">AI Exam Assistant</span>
        </h1>

        {/* Subtitle */}
        <p className="entry-subtitle text-zinc-400 text-base sm:text-lg max-w-lg leading-relaxed mb-10">
          Check exam dates, book your slot, schedule mock tests, get answers — all through a simple conversation.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleEnter}
          className="entry-cta btn-primary text-base px-8 py-4 rounded-2xl"
        >
          Start Conversation
          <ArrowRight size={18} />
        </button>

        {/* Partner logos */}
        <div className="entry-partners mt-16">
          <p className="text-[11px] text-zinc-600 uppercase tracking-[0.25em] mb-5 font-medium">
            Authorized Testing Partner For
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {partners.map((p, i) => (
              <img
                key={i}
                src={p.logo}
                alt={p.name}
                className="h-6 sm:h-7 w-auto object-contain opacity-40 grayscale invert"
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
