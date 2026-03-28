import { useState } from 'react';
import { BookOpen, Clock, FileQuestion, ArrowRight, CheckCircle, X, Trophy } from 'lucide-react';
import { mockExams } from '../data/siteData';

export default function MockExams({ showToast }) {
  const [selectedMock, setSelectedMock] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', date: '' });

  const handleBookMock = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setBookingModal(false);
    setBookingForm({ name: '', email: '', phone: '', date: '' });
    showToast(`Mock exam "${selectedMock.name}" booked successfully! Check your email for details.`, 'success');
    setSelectedMock(null);
  };

  const featuredMocks = mockExams.filter(m =>
    ['mock-cma1', 'mock-celpip-g', 'mock-ielts'].includes(m.id)
  );
  const otherMocks = mockExams.filter(m =>
    !['mock-cma1', 'mock-celpip-g', 'mock-ielts'].includes(m.id)
  );

  return (
    <section id="mock-exams" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-navy-400 text-sm font-semibold tracking-[0.2em] uppercase">Mock Exams</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            Practice in <span className="gradient-text font-serif">Real Exam Conditions</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Familiarize yourself with the testing environment and format through our authentic mock test experience
          </p>
        </div>

        {/* Featured Mock Exam Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featuredMocks.map((mock) => (
            <div
              key={mock.id}
              className="glass-card rounded-2xl p-7 flex flex-col hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-navy-400/15 flex items-center justify-center mb-5">
                <BookOpen size={22} className="text-navy-400" />
              </div>

              {/* Title */}
              <h3 className="font-bold text-white text-lg mb-1">{mock.name}</h3>

              {/* Meta */}
              <div className="flex items-center gap-3 text-gray-500 text-sm mb-3">
                <span className="flex items-center gap-1"><Clock size={13} /> {mock.duration}</span>
                <span className="flex items-center gap-1"><FileQuestion size={13} /> {mock.questions}</span>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-gold-400 mb-4">
                ₹{mock.price.toLocaleString()}
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-6 flex-grow">
                {mock.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <CheckCircle size={15} className="text-navy-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => { setSelectedMock(mock); setBookingModal(true); }}
                className="w-full py-3 rounded-xl btn-premium text-sm font-bold flex items-center justify-center gap-2"
              >
                Book Mock Test
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Other mock exams */}
        {otherMocks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {otherMocks.map((mock) => (
              <div
                key={mock.id}
                className="glass-card rounded-xl p-5 flex flex-col hover:border-gold-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-navy-400/10 text-navy-400 font-semibold">{mock.category}</span>
                  <span className={`text-xs font-medium ${
                    mock.difficulty === 'Advanced' ? 'text-red-400' :
                    mock.difficulty === 'Intermediate' ? 'text-gold-400' :
                    'text-emerald-400'
                  }`}>
                    {mock.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{mock.name}</h3>
                <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {mock.duration}</span>
                  <span className="flex items-center gap-1"><FileQuestion size={12} /> {mock.questions}</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-navy-700/50">
                  <span className="text-gold-400 font-bold">₹{mock.price.toLocaleString()}</span>
                  <button
                    onClick={() => { setSelectedMock(mock); setBookingModal(true); }}
                    className="text-xs font-bold text-navy-400 hover:text-navy-300 flex items-center gap-1"
                  >
                    Book <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats banner */}
        <div className="glass-card rounded-2xl overflow-hidden glow-cyan">
          <div className="p-8 sm:p-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-white text-2xl font-bold font-serif italic mb-3">Why Take a Mock Test?</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Our mock tests replicate the exact exam environment, helping you 
                build confidence and identify areas for improvement before exam day.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Trophy size={16} className="text-gold-400" />
                5000+ Mock Tests Conducted
              </div>
            </div>
            <div className="flex gap-5 flex-shrink-0">
              <div className="text-center px-8 py-5 rounded-xl bg-navy-800/50 border border-navy-700/50">
                <div className="text-3xl font-bold text-gold-400">95%</div>
                <div className="text-gray-500 text-sm mt-1">Success Rate</div>
              </div>
              <div className="text-center px-8 py-5 rounded-xl bg-navy-800/50 border border-navy-700/50">
                <div className="text-3xl font-bold text-gold-400">4.9</div>
                <div className="text-gray-500 text-sm mt-1">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && selectedMock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setBookingModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full glow-gold" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Book Mock Exam</h3>
              <button onClick={() => setBookingModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="mb-6 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
              <h4 className="text-gold-400 font-semibold">{selectedMock.name}</h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>{selectedMock.duration}</span>
                <span>{selectedMock.questions} questions</span>
                <span className="text-gold-400 font-bold">₹{selectedMock.price.toLocaleString()}</span>
              </div>
            </div>
            <form onSubmit={handleBookMock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  className="dark-input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  className="dark-input"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="dark-input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  min="2026-03-26"
                  className="dark-input"
                />
              </div>
              <button type="submit" className="w-full btn-premium py-3.5 rounded-xl text-base flex items-center justify-center gap-2">
                Confirm Booking
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
