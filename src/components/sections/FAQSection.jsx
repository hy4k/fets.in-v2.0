import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { faqData } from '../../data/siteData';

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-padding border-t border-light-200 bg-white">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h4 className="text-overline mb-3">FAQ</h4>
          <h2 className="heading-serif text-4xl font-semibold text-dark-950 md:text-5xl">Questions candidates ask us</h2>
          <p className="section-lead mx-auto mt-4">
            ID rules, arrival time, rescheduling, and what to leave outside the testing room.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqData.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-light-300 bg-light-100">
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-dark-950"
                aria-expanded={open === i}
              >
                {item.q}
                <ChevronDown size={20} className={`shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="border-t border-light-300"
                  >
                    <p className="px-5 py-4 text-sm leading-relaxed text-dark-800">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
