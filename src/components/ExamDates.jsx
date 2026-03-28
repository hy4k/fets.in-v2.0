import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, CheckCircle, Users } from 'lucide-react';
import { examDates } from '../data/siteData';

const examFilters = ['All Exams', 'CMA US', 'CELPIP General', 'IELTS Academic', 'TOEFL iBT', 'GRE General', 'ACCA', 'MRCS Part A', 'AWS', 'Microsoft'];
const locationFilters = ['All Locations', 'Calicut', 'Kochi'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ExamDates({ showToast }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [examFilter, setExamFilter] = useState('All Exams');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const filteredDates = useMemo(() => {
    return examDates.filter((d) => {
      const matchesExam = examFilter === 'All Exams' || d.exam === examFilter;
      const matchesLocation = locationFilter === 'All Locations' || d.location === locationFilter;
      return matchesExam && matchesLocation;
    });
  }, [examFilter, locationFilter]);

  const monthSlots = useMemo(() => {
    return filteredDates.filter((d) => {
      const dt = new Date(d.date + 'T00:00:00');
      return dt.getMonth() === month && dt.getFullYear() === year;
    }).sort((a, b) => {
      if (a.exam !== b.exam) return a.exam.localeCompare(b.exam);
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    });
  }, [filteredDates, month, year]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const formatDate = (dateStr) => {
    const dt = new Date(dateStr + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group by exam type
  const groupedByExam = useMemo(() => {
    const groups = {};
    monthSlots.forEach((slot) => {
      if (!groups[slot.exam]) groups[slot.exam] = [];
      groups[slot.exam].push(slot);
    });
    return groups;
  }, [monthSlots]);

  return (
    <section id="exam-dates" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-navy-400 text-sm font-semibold tracking-[0.2em] uppercase">Exam Calendar</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            Check <span className="gradient-text font-serif">Available Exam Dates</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Browse and book available slots for your preferred certification exam
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {/* Exam dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowExamDropdown(!showExamDropdown); setShowLocationDropdown(false); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy-700 bg-navy-900/50 text-gray-300 text-sm font-medium hover:border-navy-400 transition-all"
            >
              {examFilter}
              <ChevronLeft size={14} className="rotate-[-90deg]" />
            </button>
            {showExamDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-navy-900 rounded-xl shadow-xl border border-navy-700 py-2 z-20 min-w-[200px]">
                {examFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setExamFilter(f); setShowExamDropdown(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      examFilter === f ? 'text-gold-400 bg-gold-500/10 font-semibold' : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowLocationDropdown(!showLocationDropdown); setShowExamDropdown(false); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy-700 bg-navy-900/50 text-gray-300 text-sm font-medium hover:border-navy-400 transition-all"
            >
              {locationFilter}
              <ChevronLeft size={14} className="rotate-[-90deg]" />
            </button>
            {showLocationDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-navy-900 rounded-xl shadow-xl border border-navy-700 py-2 z-20 min-w-[180px]">
                {locationFilters.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocationFilter(l); setShowLocationDropdown(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      locationFilter === l ? 'text-gold-400 bg-gold-500/10 font-semibold' : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-navy-800 text-gray-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-navy-400" />
            <h3 className="text-white font-semibold text-lg">{monthNames[month]} {year}</h3>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-navy-800 text-gray-400 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Slot cards grid */}
        {Object.keys(groupedByExam).length > 0 ? (
          Object.entries(groupedByExam).map(([examName, slots]) => (
            <div key={examName} className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {slots.slice(0, 8).map((slot) => (
                  <div
                    key={slot.id}
                    className={`exam-slot-card ${slot.status === 'booked' ? 'booked' : ''}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm">{slot.exam}</h4>
                      {slot.status === 'available' ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                      ) : slot.status === 'limited' ? (
                        <span className="text-xs font-semibold text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded-full">Limited</span>
                      ) : (
                        <span className="text-xs font-medium text-gray-500">Booked</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <MapPin size={12} className="text-navy-400" />
                        <span>{slot.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Clock size={12} className="text-navy-400" />
                        <span>{slot.time}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {slot.status !== 'booked' && (
                      <div className="mb-4">
                        <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              slot.status === 'available' ? 'bg-emerald-400' : 'bg-gold-400'
                            }`}
                            style={{ width: `${Math.min(100, (slot.slots / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    {slot.status !== 'booked' ? (
                      <a
                        href="#book-exam"
                        onClick={() => showToast(`Selected ${slot.exam} on ${formatDate(slot.date)}`)}
                        className="block w-full text-center py-2.5 rounded-lg btn-premium text-sm font-bold"
                      >
                        Book Slot
                      </a>
                    ) : (
                      <div className="w-full text-center py-2.5 rounded-lg bg-navy-800/50 text-gray-500 text-sm">
                        Fully Booked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto mb-4 text-navy-600" />
            <p className="text-gray-500 text-lg">No exams found for this month. Try different filters or check another month.</p>
          </div>
        )}
      </div>
    </section>
  );
}
