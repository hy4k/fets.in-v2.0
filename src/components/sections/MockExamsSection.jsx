import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ClipboardList, BookOpen, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const mocks = [
  {
    name: 'CMA US',
    label: 'Test Drive',
    dur: '4 hours',
    feat: '100 MCQs + 2 Essays',
    comingSoon: false,
    list: ['Real exam simulation', 'Detailed performance analysis', 'Expert feedback session', 'Study plan recommendations'],
  },
  {
    name: 'CELPIP',
    label: 'Test Drive',
    dur: '3 hours',
    feat: 'Listening, Reading, Writing, Speaking',
    comingSoon: true,
    list: ['Full test simulation', 'Speaking practice with feedback', 'Writing evaluation', 'Score estimate'],
  },
  {
    name: 'IELTS',
    label: 'Test Drive',
    dur: '2h 45min',
    feat: 'All 4 modules',
    comingSoon: true,
    list: ['Academic/General options', 'Band score estimate', 'Detailed feedback', 'Improvement tips'],
  },
];

export default function MockExamsSection({ onBookCma }) {
  return (
    <section id="mock-exams" className="section-padding bg-[#0f0f0f]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mb-12 text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-3">Exam Test Drive</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-normal">Practice in real exam conditions</h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto leading-relaxed">
            Familiarize yourself with the testing environment and format through our authentic mock experience.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {mocks.map((mock, i) => (
            <motion.div
              key={i}
              variants={item}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all ${
                mock.comingSoon
                  ? 'border-white/[0.06] bg-white/[0.02]'
                  : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06] hover:border-[#FFD000]/30'
              }`}
            >
              {mock.comingSoon && (
                <div className="absolute top-5 right-5 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <Clock size={9} /> Soon
                </div>
              )}

              {/* Accent glow for active card */}
              {!mock.comingSoon && (
                <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#FFD000]/40 to-transparent" />
              )}

              <div className={`mb-5 text-sm font-black uppercase tracking-[0.25em] ${mock.comingSoon ? 'text-white/20' : 'text-[#FFD000]'}`}>
                {mock.label}
              </div>

              <h3 className={`text-2xl font-black mb-3 tracking-normal ${mock.comingSoon ? 'text-white/40' : 'text-white'}`}>
                {mock.name}
              </h3>

              <div className={`mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold ${mock.comingSoon ? 'text-white/20' : 'text-white/50'}`}>
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={12} /> {mock.dur}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={12} /> {mock.feat}
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {mock.list.map((line, j) => (
                  <li key={j} className={`flex items-start gap-2.5 text-sm pb-2 border-b ${mock.comingSoon ? 'border-white/[0.04] text-white/25' : 'border-white/[0.07] text-white/60'}`}>
                    <CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${mock.comingSoon ? 'text-white/20' : 'text-[#FFD000]'}`} />
                    {line}
                  </li>
                ))}
              </ul>

              {mock.comingSoon ? (
                <div className="mt-auto flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm font-bold text-white/25">
                  Coming Soon
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onBookCma}
                  className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.15)]"
                >
                  Book Test Drive <ArrowRight size={15} />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
