import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection({ onOpenChat }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[#050505] pt-32 pb-24 md:pt-44 md:pb-40">
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD000]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#FFD000]/3 blur-[100px] rounded-full" />
      </div>

      <div className="container-custom relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center">

        {/* Overline badge */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD000] shadow-inner backdrop-blur-xl"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FFD000] animate-pulse" />
          INDIA'S PREMIUM TESTING INFRASTRUCTURE
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="mb-14 flex flex-col items-center"
        >
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
            FORUN EDUCATIONAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD000] via-[#E6AC00] to-[#CC9900]">
              & TESTING SERVICES
            </span>
          </h1>
          <div className="h-1.5 w-24 bg-[#FFD000] rounded-full shadow-[0_0_20px_rgba(255,208,0,0.4)]" />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <button
            type="button"
            onClick={() => document.getElementById('calendar').scrollIntoView({ behavior: 'smooth' })}
            className="h-16 px-12 rounded-2xl bg-[#FFD000] text-dark-950 font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(255,208,0,0.15)] group"
          >
            Live Availability <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            className="h-16 px-12 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 group shadow-xl"
          >
            Ask Exam AI <WaveIcon className="text-[#FFD000] group-hover:scale-110 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function WaveIcon({ className }) {
  return (
    <svg width="20" height="16" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="6" width="3" height="6" rx="1.5" fill="currentColor" />
      <rect x="4.75" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="9.5" y="0" width="3" height="18" rx="1.5" fill="currentColor" />
      <rect x="14.25" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
      <rect x="19" y="6" width="3" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}
