import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqData } from '../../data/siteData';

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="bg-[#0a0a0a] border-t border-white/[0.06]">
      {/* Header */}
      <div className="container-custom pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-normal">Questions candidates ask</h2>
        </motion.div>
      </div>

      {/* Editorial Q&A rows */}
      <div className="border-t border-white/[0.06]">
        {faqData.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.04 }}
              className={`relative border-b border-white/[0.06] transition-colors ${isOpen ? 'bg-white/[0.02]' : 'hover:bg-white/[0.015]'}`}
            >
              {/* Giant decorative number */}
              <div
                className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none text-[80px] md:text-[120px] font-black leading-none text-white/[0.025]"
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              <button
                type="button"
                onClick={() => toggle(i)}
                className="relative z-10 flex w-full items-start justify-between gap-6 px-8 md:px-16 py-8 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-5 md:gap-8">
                  {/* Small number label */}
                  <span className="shrink-0 mt-0.5 text-[11px] font-black tracking-[0.2em] text-[#FFD000]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-base md:text-lg font-bold leading-snug transition-colors ${isOpen ? 'text-white' : 'text-white/70'}`}>
                    {item.q}
                  </span>
                </div>

                {/* Toggle indicator */}
                <div className={`shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all ${isOpen ? 'border-[#FFD000]/40 bg-[#FFD000]/10 text-[#FFD000]' : 'border-white/10 text-white/30'}`}>
                  <span className="text-lg leading-none font-light">{isOpen ? '−' : '+'}</span>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 md:px-16 pb-8 pl-[4.5rem] md:pl-[7.5rem]">
                      <p className="text-white/55 leading-relaxed text-[15px]">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="pb-20" />
    </section>
  );
}
