import { useState, useMemo } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink } from 'lucide-react';
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] border border-[#FFD000]/20">
               <Calendar size={20} />
             </div>
             <div>
               <h3 className="modal-title">Live Availability</h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Real-time Exam Calendar</p>
             </div>
          </div>
          <button className="skeuo-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body overflow-x-hidden">
          {/* Filters Bar */}
          <div className="mb-8 p-1.5 rounded-2xl bg-black border border-white/5 flex gap-1 overflow-x-auto custom-scrollbar">
            {examFilters.slice(0, 5).map((f) => (
              <button
                key={f}
                onClick={() => setExamFilter(f)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  examFilter === f
                    ? 'bg-[#FFD000] text-dark-950 shadow-lg'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Calendar Control */}
            <div className="md:w-64 flex-shrink-0">
               <div className="p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FFD000]/20 text-white/50 hover:text-[#FFD000] transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-white font-bold text-sm tracking-tight">{monthNames[month]}</span>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FFD000]/20 text-white/50 hover:text-[#FFD000] transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="text-center py-6">
                    <div className="text-[32px] font-black text-white leading-none mb-1">{year}</div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Select Month</p>
                  </div>
               </div>

               <div className="mt-6 p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-[#FFD000]/10 to-transparent">
                  <p className="text-[11px] font-medium text-white/70 leading-relaxed">
                    Showing available dates at <strong className="text-[#FFD000]">Calicut & Kochi centres</strong>. Direct booking via portal.
                  </p>
               </div>
            </div>

            {/* Slots List */}
            <div className="flex-1 space-y-3">
              {monthSlots.length > 0 ? (
                monthSlots.slice(0, 15).map((slot) => (
                  <div
                    key={slot.id}
                    className="card-premium group flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-white text-sm font-bold truncate tracking-tight">{slot.exam}</span>
                        {slot.status === 'limited' && (
                          <span className="text-[9px] font-black bg-[#FFD000]/20 text-[#FFD000] px-2 py-0.5 rounded-full border border-[#FFD000]/30">LIMITED</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-white/30">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#FFD000]/40" /> {formatDate(slot.date)}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#FFD000]/40" /> {slot.time}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#FFD000]/40" /> {slot.location}</span>
                      </div>
                    </div>
                    {slot.status !== 'booked' ? (
                      <button
                        onClick={() => onBookSlot(slot)}
                        className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-[#FFD000] hover:text-dark-950 transition-all flex items-center gap-2 shadow-sm"
                      >
                        Book <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-white/10 uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/5">Fully Booked</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <Calendar size={48} className="mx-auto mb-4 text-white/5" />
                  <p className="text-white/30 text-sm font-medium">No slots found for this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

const ArrowRight = ({ size, className }) => (
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
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
