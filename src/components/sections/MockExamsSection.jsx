import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ClipboardList, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const mocks = [
  {
    name: 'CMA US Mock Test',
    dur: '4 hours',
    feat: '100 MCQs + 2 Essays',
    price: '₹2,500',
    isCMA: true,
    list: ['Real exam simulation', 'Detailed performance analysis', 'Expert feedback session', 'Study plan recommendations'],
  },
  {
    name: 'CELPIP Mock Test',
    dur: '3 hours',
    feat: 'Listening, Reading, Writing, Speaking',
    price: '₹2,000',
    isCMA: false,
    list: ['Full test simulation', 'Speaking practice with feedback', 'Writing evaluation', 'Score estimate'],
  },
  {
    name: 'IELTS Mock Test',
    dur: '2h 45min',
    feat: 'All 4 modules',
    price: '₹1,800',
    isCMA: false,
    list: ['Academic/General options', 'Band score estimate', 'Detailed feedback', 'Improvement tips'],
  },
];

export default function MockExamsSection({ onBookCma, onBookOther }) {
  return (
    <section id="mock-exams" className="section-padding bg-light-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mb-12 text-center"
        >
          <h4 className="text-overline mb-3">Mock exams</h4>
          <h2 className="heading-serif text-4xl font-semibold text-dark-950 md:text-5xl">Practice in real exam conditions</h2>
          <p className="section-lead mx-auto mt-4">
            Familiarize yourself with the testing environment and format through our authentic mock experience.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {mocks.map((mock, i) => (
            <motion.div
              key={i}
              variants={item}
              className="clean-card group relative flex h-full flex-col overflow-hidden border border-light-300 bg-[#f8f8f4] shadow-sm"
            >
              <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-primary-400 opacity-5 transition-transform group-hover:scale-110" />
              <div className="mb-4 text-primary-500">
                <ClipboardList size={28} />
              </div>
              <h3 className="heading-serif mb-2 text-2xl font-semibold text-dark-950">{mock.name}</h3>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-medium text-dark-800">
                <span className="flex items-center gap-1">
                  <CalendarIcon size={14} /> {mock.dur}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={14} /> {mock.feat}
                </span>
              </div>
              <div className="mb-6 text-3xl font-bold text-primary-500">{mock.price}</div>
              <ul className="mb-8 flex-1 space-y-3">
                {mock.list.map((line, j) => (
                  <li key={j} className="flex items-start gap-2 border-b border-light-200 pb-2 text-sm text-dark-900">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-500" /> {line}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => (mock.isCMA ? onBookCma() : onBookOther?.())}
                className="btn-primary mt-auto w-full shadow-sm hover:shadow-md"
              >
                Book mock test <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
