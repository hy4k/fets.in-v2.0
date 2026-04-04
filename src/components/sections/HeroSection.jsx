import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#050505] pt-32 pb-24 md:pt-44 md:pb-40">
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD000]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#FFD000]/3 blur-[100px] rounded-full" />
      </div>

      <div className="container-custom relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center">

        {/* Headline */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-normal leading-none mb-4">
            FORUN EDUCATIONAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD000] via-[#E6AC00] to-[#CC9900]">
              &amp; TESTING SERVICES
            </span>
          </h1>
          <div className="h-1.5 w-24 bg-[#FFD000] rounded-full shadow-[0_0_20px_rgba(255,208,0,0.4)]" />
        </motion.div>

      </div>
    </section>
  );
}

