import { useState } from 'react';
import { CreditCard, CheckCircle, ArrowRight, MapPin, Calendar, User, FileText } from 'lucide-react';

const steps = [
  { num: 1, label: 'Exam Details', icon: FileText },
  { num: 2, label: 'Personal Info', icon: User },
  { num: 3, label: 'Confirmation', icon: CheckCircle },
];

const examOptions = [
  { value: '', label: 'Select an exam...' },
  { value: 'CMA US Part 1', label: 'CMA US Part 1 - Financial Planning', fee: 15000 },
  { value: 'CMA US Part 2', label: 'CMA US Part 2 - Strategic Management', fee: 15000 },
  { value: 'CELPIP General', label: 'CELPIP General', fee: 12000 },
  { value: 'CELPIP LS', label: 'CELPIP LS (Listening & Speaking)', fee: 9000 },
  { value: 'IELTS Academic', label: 'IELTS Academic', fee: 16500 },
  { value: 'IELTS General', label: 'IELTS General Training', fee: 16500 },
  { value: 'TOEFL iBT', label: 'TOEFL iBT', fee: 13500 },
  { value: 'GRE General', label: 'GRE General Test', fee: 22000 },
  { value: 'ACCA', label: 'ACCA Examination', fee: 8500 },
  { value: 'MRCS Part A', label: 'MRCS Part A', fee: 25000 },
  { value: 'AWS Cloud', label: 'AWS Cloud Practitioner', fee: 5000 },
  { value: 'Microsoft', label: 'Microsoft Certification', fee: 5000 },
];

export default function BookExam({ showToast }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    exam: '',
    location: 'Calicut',
    preferredDate: '',
    altDate: '',
    name: '',
    email: '',
    phone: '',
    idType: 'Passport',
    idNumber: '',
    specialReq: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedExam = examOptions.find((e) => e.value === bookingData.exam);

  const handleNext = () => {
    if (step === 1 && (!bookingData.exam || !bookingData.preferredDate)) {
      showToast('Please select an exam and preferred date.', 'error');
      return;
    }
    if (step === 2 && (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.idNumber)) {
      showToast('Please fill in all required personal details.', 'error');
      return;
    }
    if (step < 3) setStep(step + 1);
    else {
      setSubmitted(true);
      showToast('Booking request submitted! We\'ll confirm your slot within 24 hours.', 'success');
    }
  };

  if (submitted) {
    return (
      <section id="book-exam" className="py-24 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-10 text-center glow-gold">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Booking Request Submitted!</h3>
            <p className="text-gray-400 mb-4">
              Thank you, <span className="text-white font-medium">{bookingData.name}</span>. Your booking request for{' '}
              <span className="text-gold-400 font-medium">{bookingData.exam}</span> has been received.
            </p>
            <div className="glass-card-light rounded-xl p-4 max-w-md mx-auto text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exam:</span>
                <span className="text-white font-medium">{bookingData.exam}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Location:</span>
                <span className="text-white font-medium">{bookingData.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Preferred Date:</span>
                <span className="text-white font-medium">{bookingData.preferredDate}</span>
              </div>
              {selectedExam?.fee && (
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">Estimated Fee:</span>
                  <span className="text-gold-400 font-semibold">{'\u20B9'}{selectedExam.fee.toLocaleString()}</span>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              Our team will verify availability and contact you within 24 hours with confirmation details and payment instructions.
            </p>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setBookingData({ exam: '', location: 'Calicut', preferredDate: '', altDate: '', name: '', email: '', phone: '', idType: 'Passport', idNumber: '', specialReq: '' }); }}
              className="mt-6 btn-outline-premium px-6 py-3 rounded-xl text-sm"
            >
              Make Another Booking
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book-exam" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-navy-400 text-sm font-semibold tracking-[0.15em] uppercase">Book Your Exam</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            Book <span className="gradient-text font-serif">Through FETS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Let us handle the booking process for you. Submit your exam preferences and we'll secure your slot.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                step >= s.num ? 'bg-gold-500/20 text-gold-400' : 'text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > s.num ? 'bg-emerald-500/20 text-emerald-400' : step === s.num ? 'bg-gold-500/30 text-gold-400' : 'bg-white/5 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? 'bg-gold-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="glass-card rounded-3xl p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white mb-4">Exam Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Exam *</label>
                <select
                  value={bookingData.exam}
                  onChange={(e) => setBookingData({ ...bookingData, exam: e.target.value })}
                  className="dark-input"
                >
                  {examOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-navy-900">
                      {o.label} {o.fee ? `- \u20B9${o.fee.toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Preferred Centre</label>
                <div className="flex gap-3">
                  {['Calicut', 'Kochi'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, location: loc })}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        bookingData.location === loc
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <MapPin size={16} />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Preferred Date *</label>
                  <input
                    type="date"
                    value={bookingData.preferredDate}
                    onChange={(e) => setBookingData({ ...bookingData, preferredDate: e.target.value })}
                    min="2026-03-26"
                    className="dark-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Alternate Date</label>
                  <input
                    type="date"
                    value={bookingData.altDate}
                    onChange={(e) => setBookingData({ ...bookingData, altDate: e.target.value })}
                    min="2026-03-26"
                    className="dark-input"
                  />
                </div>
              </div>
              {selectedExam?.fee && (
                <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Estimated Exam Fee</span>
                    <span className="text-gold-400 text-xl font-bold">{'\u20B9'}{selectedExam.fee.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Final fee may vary. You'll receive exact pricing upon confirmation.</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name (as on ID) *</label>
                <input
                  type="text"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  className="dark-input"
                  placeholder="Enter your name exactly as on your ID"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="dark-input"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="dark-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">ID Type</label>
                  <select
                    value={bookingData.idType}
                    onChange={(e) => setBookingData({ ...bookingData, idType: e.target.value })}
                    className="dark-input"
                  >
                    <option value="Passport" className="bg-navy-900">Passport</option>
                    <option value="Aadhar" className="bg-navy-900">Aadhar Card</option>
                    <option value="Driving License" className="bg-navy-900">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">ID Number *</label>
                  <input
                    type="text"
                    value={bookingData.idNumber}
                    onChange={(e) => setBookingData({ ...bookingData, idNumber: e.target.value })}
                    className="dark-input"
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Special Requirements</label>
                <textarea
                  value={bookingData.specialReq}
                  onChange={(e) => setBookingData({ ...bookingData, specialReq: e.target.value })}
                  rows={3}
                  className="dark-input resize-none"
                  placeholder="Any accessibility needs or special accommodations..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white mb-4">Review & Confirm</h3>
              <div className="space-y-3">
                {[
                  { label: 'Exam', value: bookingData.exam },
                  { label: 'Centre', value: bookingData.location },
                  { label: 'Preferred Date', value: bookingData.preferredDate },
                  { label: 'Alternate Date', value: bookingData.altDate || 'Not specified' },
                  { label: 'Full Name', value: bookingData.name },
                  { label: 'Email', value: bookingData.email },
                  { label: 'Phone', value: bookingData.phone },
                  { label: 'ID', value: `${bookingData.idType}: ${bookingData.idNumber}` },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
                {selectedExam?.fee && (
                  <div className="flex justify-between py-3 border-t border-gold-500/20 mt-4">
                    <span className="text-gold-400 font-medium">Estimated Fee</span>
                    <span className="text-gold-400 text-xl font-bold">{'\u20B9'}{selectedExam.fee.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                By submitting, you agree to our booking terms. Our team will verify availability and contact you within 24 hours with confirmation and payment details.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all text-sm font-medium"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              className="btn-premium px-8 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              {step === 3 ? 'Submit Booking Request' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
