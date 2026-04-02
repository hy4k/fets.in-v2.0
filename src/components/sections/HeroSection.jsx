import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  show: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function HeroSection({ onOpenChat }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[#050505] pt-32 pb-24 md:pt-44 md:pb-40">
      {/* Dynamic Background subtle elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD000]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#FFD000]/3 blur-[100px] rounded-full" />
      </div>

      <div className="container-custom relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6">
        <motion.div 
          variants={fade} 
          initial="hidden" 
          animate="show" 
          className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD000] shadow-inner backdrop-blur-xl"
        >
          <Sparkles size={14} className="animate-pulse" />
          KERALA'S PREMIER TESTING INFRASTRUCTURE
        </motion.div>

        <motion.div 
          variants={fade} 
          initial="hidden" 
          animate="show" 
          transition={{ delay: 0.1 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
            FORUN EDUCATIONAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD000] via-[#E6AC00] to-[#CC9900]">
              & TESTING SERVICES
            </span>
          </h1>
          <div className="h-1.5 w-24 bg-[#FFD000] rounded-full mb-8 shadow-[0_0_20px_rgba(255,208,0,0.4)]" />
          
          <p className="max-w-2xl text-lg md:text-xl font-medium text-white/40 leading-relaxed mb-12 tracking-tight">
            The elite gateway for professional certifications and global testing. 
            State-of-the-art authorised centres in <span className="text-white">Calicut</span> and <span className="text-white">Kochi</span>.
          </p>
        </motion.div>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-5 mb-24"
        >
          <button 
            type="button" 
            onClick={() => document.getElementById('calendar').scrollIntoView({ behavior: 'smooth' })}
            className="h-16 px-12 rounded-2xl bg-[#FFD000] text-dark-950 font-black text-sm uppercase tracking-widest hover:bg-[#ffe44d] transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(255,208,0,0.15)] group"
          >
            Live Availability <Calendar size={18} className="group-hover:translate-y-[-1px] transition-transform" />
          </button>
          
          <button 
            type="button" 
            onClick={onOpenChat} 
            className="h-16 px-12 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 group shadow-xl"
          >
            Ask EXAM ASSIST <Bot size={18} className="group-hover:scale-110 transition-transform text-[#FFD000]" />
          </button>
        </motion.div>

        {/* Brand shelf */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px w-12 bg-white/5" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">
                 Global Accreditation Partners
               </h4>
               <div className="h-px w-12 bg-white/5" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700 w-full max-w-5xl px-8 py-10 rounded-[32px] bg-white/[0.02] border border-white/5 shadow-inner">
               <img src="/images/logos/prometric.png" alt="Prometric" className="h-8 md:h-10 object-contain invert brightness-0" />
               <img src="/images/logos/pearson-vue.png" alt="Pearson VUE" className="h-8 md:h-10 object-contain invert brightness-0" />
               <img src="/images/logos/celpip.jpg" alt="CELPIP" className="h-10 md:h-12 object-contain invert brightness-0" />
               <img src="/images/logos/cma-usa.png" alt="CMA" className="h-12 md:h-14 object-contain invert brightness-0" />
               <img src="/images/logos/psi.png" alt="PSI" className="h-12 md:h-14 object-contain invert brightness-0" />
            </div>
          </div>
        </motion.div>

        {/* Feature badges */}
        <motion.div 
           variants={stagger}
           initial="hidden"
           whileInView="show"
           className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
        >
           {[
             { i: ShieldCheck, t: 'Authorized Center', d: 'Prometric & Pearson VUE certified security' },
             { i: Award, t: 'Expert Proctors', d: 'Highly trained professionals for audit compliance' },
             { i: Zap, t: 'Instant Booking', d: 'Real-time allocation of premium test slots' }
           ].map((badge, i) => (
             <motion.div key={i} variants={fade} className="flex items-center gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] border border-[#FFD000]/20 group-hover:bg-[#FFD000] group-hover:text-dark-950 transition-all duration-500">
                  <badge.i size={24} />
                </div>
                <div>
                   <h5 className="text-white font-black text-sm tracking-tight mb-1">{badge.t}</h5>
                   <p className="text-[11px] font-medium text-white/30 leading-relaxed uppercase tracking-widest">{badge.d}</p>
                </div>
             </motion.div>
           ))}
        </motion.div>
      </div>
    </section>
  );
}

const Calendar = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const Bot = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
