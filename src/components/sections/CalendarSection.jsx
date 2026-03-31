import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, MapPin } from 'lucide-react';
import { examDates } from '../../data/siteData';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EXAM_OPTIONS = [
  'All Exams',
  'CMA US',
  'CELPIP General',
  'IELTS Academic',
  'TOEFL iBT',
  'GRE General',
  'ACCA',
  'MRCS Part A',
  'AWS',
  'Microsoft',
];

const LOC_OPTIONS = ['All Locations', 'Calicut', 'Kochi'];

export default function CalendarSection() {
  const initial = new Date(2026, 2, 1);
  const [viewMonth, setViewMonth] = useState(initial);
  const [examFilter, setExamFilter] = useState('All Exams');
  const [locFilter, setLocFilter] = useState('All Locations');

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const filteredSlots = useMemo(() => {
    return examDates
      .filter((slot) => {
        const d = new Date(`${slot.date}T00:00:00`);
        if (d.getMonth() !== month || d.getFullYear() !== year) return false;
        if (examFilter !== 'All Exams' && slot.exam !== examFilter) return false;
        if (locFilter !== 'All Locations' && slot.location !== locFilter) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [examFilter, locFilter, month, year]);

  const visibleSlots = filteredSlots.slice(0, 24);

  const goMonth = (delta) => {
    setViewMonth(new Date(year, month + delta, 1));
  };

  return (
    <section id="calendar" className="section-padding border-t border-light-200 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <h4 className="text-overline mb-3">Exam calendar</h4>
          <h2 className="heading-serif text-4xl font-semibold text-dark-950 md:text-5xl">Check available exam dates</h2>
          <p className="section-lead mx-auto mt-4">
            Browse sample availability for your certification. Filter by exam and centre—confirm final slots with our team when you book.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="cal-exam">
            Filter by exam
          </label>
          <select
            id="cal-exam"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="input-clean w-full max-w-xs cursor-pointer border-light-300 bg-light-100 font-semibold text-dark-950 shadow-sm sm:w-48"
          >
            {EXAM_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="cal-loc">
            Filter by location
          </label>
          <select
            id="cal-loc"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            className="input-clean w-full max-w-xs cursor-pointer border-light-300 bg-light-100 font-semibold text-dark-950 shadow-sm sm:w-48"
          >
            {LOC_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4 text-lg font-semibold text-dark-950">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-light-300 shadow-sm transition-colors hover:bg-light-200"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <span className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary-500" />
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-light-300 shadow-sm transition-colors hover:bg-light-200"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-20px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {visibleSlots.length === 0 ? (
            <p className="col-span-full py-12 text-center text-dark-800">
              No slots match these filters for this month. Try another month or clear filters.
            </p>
          ) : (
            visibleSlots.map((slot, i) => (
              <motion.div
                key={`${slot.id}-${i}`}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="calendar-card relative"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-sm font-bold text-dark-950">{slot.exam}</h4>
                  {slot.status === 'booked' ? (
                    <span className="rounded-sm bg-light-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-dark-800">Booked</span>
                  ) : (
                    <CheckCircle2 size={16} className="text-green-500" />
                  )}
                </div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-dark-800">
                  <MapPin size={12} /> @ {slot.location}
                </div>
                <div className="mb-4 flex items-center gap-1 pl-0.5 text-xs font-medium text-dark-800">
                  <CalendarIcon size={11} className="text-primary-500" /> {slot.date} · {slot.time}
                </div>
                <button
                  type="button"
                  disabled={slot.status === 'booked'}
                  className={`w-full break-words rounded border py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    slot.status === 'booked'
                      ? 'cursor-not-allowed border-light-300 bg-light-200 text-dark-800/50'
                      : 'border-primary-500 bg-primary-400 text-dark-950 shadow-sm hover:bg-primary-500'
                  }`}
                >
                  {slot.status === 'booked' ? 'Unavailable' : 'Request slot'}
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}
