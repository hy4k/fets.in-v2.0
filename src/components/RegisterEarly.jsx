import { useState } from 'react';
import { Bell, Star, CheckCircle, ArrowRight, User, Mail, Phone } from 'lucide-react';

const benefits = [
  'First to know about new exam dates',
  'Exclusive early bird discounts',
  'Priority booking for CMA US & CELPIP',
  'Free study material updates',
  'Exam tips and preparation guides',
];

const examOptions = ['CMA US', 'CELPIP', 'IELTS', 'TOEFL', 'GRE', 'ACCA', 'MRCS', 'AWS', 'Microsoft', 'Other'];

export default function RegisterEarly({ showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    exam: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast('Registration successful! You\'ll receive early exam date notifications.', 'success');
    }, 1500);
  };

  if (submitted) {
    return (
      <section id="register" className="py-24 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl p-10 text-center glow-cyan">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">You're Registered!</h3>
            <p className="text-gray-400 mb-2">
              Welcome to the FETS Early Access program. You'll be among the first to know when new exam dates become available.
            </p>
            <p className="text-gold-400 font-medium">
              We'll notify you at {formData.email}
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', exam: '' }); }}
              className="mt-6 text-navy-400 underline text-sm hover:text-navy-300"
            >
              Register another person
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Info */}
          <div className="pt-4">
            <span className="text-navy-400 text-sm font-semibold tracking-[0.2em] uppercase">Exclusive Access</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-6 leading-tight">
              Get <span className="gradient-text font-serif">Early Access</span> to<br />Exam Dates
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Register with us to be the first to know about opening dates for exams, especially for 
              CMA US and CELPIP candidates. This exclusive service is designed to give you a 
              competitive advantage in your certification journey.
            </p>
            {/* Benefits list */}
            <div className="space-y-4 mb-8">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-navy-400 flex-shrink-0" />
                  <p className="text-gray-300">{b}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-gold-400 font-semibold text-sm">
              <Star size={16} className="text-gold-400" />
              Especially for CMA US & CELPIP Candidates
            </div>
          </div>

          {/* Right: Form Card */}
          <div className="glass-card rounded-3xl p-8 lg:p-10 glow-cyan">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-navy-400/20 flex items-center justify-center">
                <Bell size={22} className="text-navy-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Register for Updates</h3>
                <p className="text-gray-400 text-sm">Join our exclusive notification list</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-2">
                  <User size={14} className="text-navy-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="dark-input"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-2">
                  <Mail size={14} className="text-navy-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="dark-input"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-2">
                  <Phone size={14} className="text-navy-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="dark-input"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Exam Selector */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Interested Exam</label>
                <select
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="dark-select"
                >
                  <option value="">Select an exam</option>
                  {examOptions.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <Star size={10} className="text-gold-400" /> Priority notification exams
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-premium py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="animate-spin w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    Register for Exclusive Updates
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to receive notifications about exam dates and related services. You can unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
