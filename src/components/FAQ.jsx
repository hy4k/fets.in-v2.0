import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqData } from '../data/siteData';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-navy-400 text-sm font-semibold tracking-[0.15em] uppercase">FAQ</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            Frequently Asked <span className="gradient-text font-serif">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about taking exams at FETS.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqData.map((item, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'border-gold-500/30' : ''
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-white font-medium text-base pr-4">{item.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-gold-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-400 leading-relaxed text-sm border-t border-white/5 pt-4">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm mb-3">Still have questions?</p>
          <a href="#contact" className="btn-outline-premium px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            <HelpCircle size={18} />
            Contact Our Team
          </a>
        </div>
      </div>
    </section>
  );
}
