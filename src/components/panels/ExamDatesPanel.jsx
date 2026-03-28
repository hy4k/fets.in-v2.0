import { useState, useMemo } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, MapPin, Clock, CheckCircle } from 'lucide-react';
import { examDates } from '../../data/siteData';

const examFilters = ['All', 'CMA US', 'CELPIP General', 'IELTS Academic', 'TOEFL iBT', 'GRE General', 'ACCA', 'MRCS Part A', 'AWS', 'Microsoft'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ExamDatesPanel({ onClose, onBookSlot }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [examFilter, setExamFilter] = useState('All');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthSlots = useMemo(() => {
    return examDates
      .filter((d) => {
        const matchesExam = examFilter === 'All' || d.exam === examFilter;
        const dt = new Date(d.date + 'T00:00:00');
        return matchesExam && dt.getMonth() === month && dt.getFullYear() === year;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [examFilter, month, year]);

  const formatDate = (dateStr) => {
    const dt = new Date(dateStr + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel-slide">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-rose-400" />
            <h3 className="text-white font-semibold">Exam Dates</h3>
          </div>
          <button className="panel-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="panel-body">
          {/* Facility Image */}
          <img
            src="/images/facility/calicut-testing-stations.jpg"
            alt="FETS Testing Facility"
            className="panel-image mb-5"
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {examFilters.map((f) => (
              <button
                key={f}
                onClick={() => setExamFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  examFilter === f
                    ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                    : 'text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="btn-ghost p-2">
              <ChevronLeft size={16} />
            </button>
            <span className="text-white font-medium text-sm">{monthNames[month]} {year}</span>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="btn-ghost p-2">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Slots */}
          <div className="space-y-2">
            {monthSlots.length > 0 ? (
              monthSlots.slice(0, 20).map((slot) => (
                <div
                  key={slot.id}
                  className={`data-card flex items-center justify-between ${slot.status === 'booked' ? 'opacity-40' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-semibold truncate">{slot.exam}</span>
                      {slot.status === 'limited' && (
                        <span className="text-[10px] font-bold text-gold-300 bg-gold-300/15 px-1.5 py-0.5 rounded-full">LIMITED</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(slot.date)}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {slot.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} /> {slot.location}</span>
                    </div>
                  </div>
                  {slot.status !== 'booked' ? (
                    <button
                      onClick={() => onBookSlot(slot)}
                      className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                    >
                      Book
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-600">Full</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Calendar size={32} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-zinc-500 text-sm">No exams found. Try a different filter or month.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
