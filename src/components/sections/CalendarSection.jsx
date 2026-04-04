import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { examDates } from '../../data/siteData';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EXAM_OPTIONS = [
  'All Exams', 'CMA US', 'CELPIP General', 'IELTS Academic',
  'TOEFL iBT', 'GRE General', 'ACCA', 'MRCS Part A', 'AWS', 'Microsoft',
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
  const goMonth = (delta) => setViewMonth(new Date(year, month + delta, 1));

  return (
    <section id="calendar" className="section-padding bg-[#0a0a0a] border-t border-white/[0.06]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-3">Exam calendar</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Check available exam dates</h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto leading-relaxed">
            Browse sample availability for your certification. Confirm final slots with our team when you book.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="w-full max-w-xs cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white sm:w-48 outline-none focus:border-[#FFD000]/40"
          >
            {EXAM_OPTIONS.map((o) => <option key={o} value={o} className="bg-[#0f0f0f] text-white">{o}</option>)}
          </select>
          <select
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            className="w-full max-w-xs cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white sm:w-48 outline-none focus:border-[#FFD000]/40"
          >
            {LOC_OPTIONS.map((o) => <option key={o} value={o} className="bg-[#0f0f0f] text-white">{o}</option>)}
          </select>
        </div>

        {/* Month nav */}
        <div className="mb-8 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="flex items-center gap-2 text-lg font-black text-white">
            <CalendarIcon size={16} className="text-[#FFD000]" />
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-20px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {visibleSlots.length === 0 ? (
            <p className="col-span-full py-12 text-center text-white/40">
              No slots match these filters for this month. Try another month or clear filters.
            </p>
          ) : (
            visibleSlots.map((slot, i) => (
              <motion.div
                key={`${slot.id}-${i}`}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-[#FFD000]/20 hover:bg-white/[0.05]"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white leading-snug">{slot.exam}</h4>
                  {slot.status === 'booked' ? (
                    <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/30">Full</span>
                  ) : (
                    <CheckCircle2 size={14} className="shrink-0 text-[#FFD000] mt-0.5" />
                  )}
                </div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-white/40">
                  <MapPin size={11} className="text-[#FFD000]/60" /> {slot.location}
                </div>
                <div className="mb-4 text-xs font-medium text-white/40">
                  {slot.date} · {slot.time}
                </div>
                <button
                  type="button"
                  disabled={slot.status === 'booked'}
                  className={`w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    slot.status === 'booked'
                      ? 'cursor-not-allowed bg-white/[0.03] text-white/20'
                      : 'bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d]'
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
