import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection({ onOpenChat }) {
  return (
    <section id="top" className="relative overflow-hidden bg-light-100 pt-20 md:pt-24">
      <div className="pointer-events-none absolute top-10 left-1/4 h-72 w-72 rounded-full bg-[#FFD150]/20 blur-[80px] mix-blend-multiply animate-blob md:h-[500px] md:w-[500px]" />
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-[#458B73]/15 blur-[80px] mix-blend-multiply animation-delay-2000 animate-blob md:h-[400px] md:w-[400px]" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-80 w-80 rounded-full bg-[#F26076]/10 blur-[80px] mix-blend-multiply animation-delay-4000 animate-blob md:h-[600px] md:w-[600px]" />

      <div className="container-custom relative z-10 mx-auto flex max-w-5xl flex-col items-center py-16 text-center md:py-20">
        <motion.div variants={fade} initial="hidden" animate="show" className="mb-10 inline-flex items-center gap-2 rounded-full border border-light-300 bg-white/80 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-dark-800 shadow-sm backdrop-blur-md">
          <Sparkles size={14} className="text-accent-500" />
          Student-first exam hub · Kozhikode & Kochi
        </motion.div>

        <motion.div variants={fade} initial="hidden" animate="show" transition={{ delay: 0.08 }} className="mb-14 flex w-full justify-center">
          <img
            src="/images/logos/forun-logo.png"
            alt="Forun Testing & Educational Services"
            className="h-28 object-contain mix-blend-multiply sm:h-36 md:h-44"
          />
        </motion.div>

        <motion.p
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.12 }}
          className="section-lead mx-auto mb-10 text-balance px-2 text-base text-dark-800"
        >
          Book certification exams, practise with mocks, and use free checklists and timelines—built for serious candidates who want clarity, not noise.
        </motion.p>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.18 }}
          className="mb-20 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-6"
        >
          <a href="#calendar" className="btn-nav h-14 px-10 text-[15px] shadow-sm">
            Check exam dates <ArrowRight size={18} className="ml-2" />
          </a>
          <button type="button" onClick={onOpenChat} className="btn-nav h-14 px-10 text-[15px] shadow-sm">
            Ask EXAM ASSIST <Sparkles size={18} className="ml-2 text-accent-500" />
          </button>
        </motion.div>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="flex w-full max-w-4xl flex-col items-center"
        >
          <h4 className="mb-6 border-b border-light-300/50 px-8 pb-2 text-[10px] font-bold uppercase tracking-widest text-dark-500">
            Certified testing partners
          </h4>
          <div className="flex w-full flex-wrap items-center justify-center gap-8 rounded-[2rem] border border-light-200/60 bg-white/60 px-8 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg transition-transform hover:-translate-y-1 md:gap-14 md:py-10 lg:gap-16">
            <img src="/images/logos/prometric.png" alt="Prometric" className="h-10 object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105 md:h-12" />
            <img src="/images/logos/pearson-vue.png" alt="Pearson VUE" className="h-10 object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105 md:h-12" />
            <img src="/images/logos/celpip.jpg" alt="CELPIP" className="h-10 object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105 md:h-12" />
            <img src="/images/logos/cma-usa.png" alt="CMA" className="h-12 object-contain transition-transform duration-300 hover:scale-105 md:h-16" />
            <img src="/images/logos/psi.png" alt="PSI" className="h-12 object-contain transition-transform duration-300 hover:scale-105 md:h-16" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
