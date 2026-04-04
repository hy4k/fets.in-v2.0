import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { faqData } from '../../data/siteData';

export default function FAQSection() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);

  const select = (i) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };

  // Auto-advance on idle
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % faqData.length), 6000);
    return () => clearInterval(t);
  }, []);

  const item = faqData[active];
  const num = String(active + 1).padStart(2, '0');

  return (
    <section id="faq" className="bg-[#0a0a0a] border-t border-white/[0.06] overflow-hidden">

      {/* Section label row */}
      <div className="container-custom flex items-center justify-between pt-16 pb-10">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-normal">
            Questions candidates ask
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-2 text-white/20 text-sm font-black tabular-nums">
          <span className="text-white/70">{num}</span>
          <span className="text-[10px]">/</span>
          <span>{String(faqData.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Main layout: question list left, answer panel right */}
      <div className="container-custom pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d]">

          {/* ── LEFT: question index ── */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/[0.07]">
            {faqData.map((q, i) => {
              const isActive = active === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(i)}
                  className={`group relative w-full flex items-start gap-4 px-6 py-5 text-left transition-all duration-200 border-b border-white/[0.05] last:border-b-0
                    ${isActive
                      ? 'bg-[#FFD000]/[0.06]'
                      : 'hover:bg-white/[0.03]'
                    }`}
                >
                  {/* Active bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 rounded-r-full ${isActive ? 'bg-[#FFD000]' : 'bg-transparent'}`} />

                  {/* Number */}
                  <span className={`shrink-0 text-[11px] font-black tabular-nums mt-0.5 transition-colors duration-200
                    ${isActive ? 'text-[#FFD000]' : 'text-white/20 group-hover:text-white/40'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Question */}
                  <span className={`text-sm leading-snug font-semibold transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-white/45 group-hover:text-white/70'}`}>
                    {q.q}
                  </span>

                  {/* Progress bar on active item */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FFD000]/10 overflow-hidden">
                      <motion.div
                        key={active}
                        className="h-full bg-[#FFD000]/40"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 6, ease: 'linear' }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── RIGHT: answer panel ── */}
          <div className="lg:col-span-3 relative flex flex-col justify-between p-8 md:p-12 min-h-[360px] overflow-hidden">

            {/* Decorative giant number */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-6 bottom-4 font-black leading-none select-none text-white/[0.03]"
              style={{ fontSize: 'clamp(100px, 18vw, 200px)' }}
            >
              {num}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col gap-6"
              >
                {/* Q label + question */}
                <div>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD000]">Question {num}</span>
                    <div className="h-px w-6 bg-[#FFD000]/40" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-snug tracking-normal">
                    {item.q}
                  </h3>
                </div>

                {/* Divider */}
                <div className="h-px w-12 bg-[#FFD000]/30" />

                {/* Answer */}
                <p className="text-white/60 leading-relaxed text-[15px] md:text-base max-w-prose">
                  {item.a}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Bottom: navigation arrows */}
            <div className="relative z-10 flex items-center gap-3 mt-10">
              <button
                type="button"
                onClick={() => select((active - 1 + faqData.length) % faqData.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:border-[#FFD000]/30 hover:text-[#FFD000] transition-all"
                aria-label="Previous question"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => select((active + 1) % faqData.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:border-[#FFD000]/30 hover:text-[#FFD000] transition-all"
                aria-label="Next question"
              >
                <ChevronRight />
              </button>
              {/* Dot indicators */}
              <div className="flex items-center gap-1.5 ml-2">
                {faqData.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => select(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === active
                        ? 'w-5 h-1.5 bg-[#FFD000]'
                        : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                    }`}
                    aria-label={`Go to question ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
