import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Train, Bus, Plane, Navigation, Send, ArrowRight } from 'lucide-react';
import { centers } from '../data/siteData';

const modeIcons = {
  Train: Train,
  Bus: Bus,
  Air: Plane,
  Metro: Train,
};

export default function Contact() {
  const [activeCenter, setActiveCenter] = useState('calicut');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const center = centers.find((c) => c.id === activeCenter);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }, 1200);
  };

  return (
    <section id="contact" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-navy-400 text-sm font-semibold tracking-[0.15em] uppercase">Get in Touch</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            Visit Our <span className="gradient-text font-serif">Centers</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Two convenient locations in Kerala. Reach out for any queries about exams, bookings, or our services.
          </p>
          {/* Main phone number banner */}
          <div className="inline-flex items-center gap-3 mt-6 px-6 py-3 rounded-2xl bg-gold-500/10 border border-gold-500/20">
            <Phone size={20} className="text-gold-400" />
            <a href="tel:+919605686000" className="text-gold-400 text-lg font-bold hover:text-gold-300 transition-colors">
              +91 9605686000
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Center info */}
          <div>
            {/* Center tabs */}
            <div className="flex gap-3 mb-6">
              {centers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCenter(c.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    activeCenter === c.id
                      ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <MapPin size={16} />
                  {c.name}
                </button>
              ))}
            </div>

            {/* Center details card with image */}
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Center image */}
              {center.images && center.images[0] && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={center.images[0]}
                    alt={center.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <h3 className="text-white font-bold text-xl">{center.name}</h3>
                    <p className="text-gray-300 text-sm">Forun Testing & Educational Services</p>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-gold-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">{center.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gold-400 flex-shrink-0" />
                    <div className="text-sm">
                      <a href={`tel:${center.phone.replace(/\s/g, '')}`} className="text-gray-300 hover:text-gold-400 transition-colors">
                        {center.phone}
                      </a>
                      <span className="text-gray-500 mx-2">|</span>
                      <a href="tel:+919605686000" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
                        +91 9605686000
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gold-400 flex-shrink-0" />
                    <a href={`mailto:${center.email}`} className="text-gray-300 text-sm hover:text-gold-400 transition-colors">
                      {center.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-gold-400 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">{center.hours}</p>
                  </div>
                </div>

                {/* Directions */}
                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-white font-medium text-sm mb-3">How to Reach Us</h4>
                  <div className="space-y-2">
                    {center.directions.map((d, i) => {
                      const Icon = modeIcons[d.mode] || Navigation;
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <Icon size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">
                            <span className="text-gray-300 font-medium">By {d.mode}:</span> {d.detail}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Map link */}
                <a
                  href={center.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium hover:text-gold-300 transition-colors"
                >
                  <Navigation size={16} />
                  Open in Google Maps
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <Send size={20} className="text-gold-400" />
              Send Us a Message
            </h3>
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-emerald-400" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">Message Sent!</h4>
                <p className="text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="dark-input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="dark-input"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="dark-input"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="dark-input"
                  >
                    <option value="" className="bg-navy-900">Select subject...</option>
                    <option value="booking" className="bg-navy-900">Exam Booking Inquiry</option>
                    <option value="dates" className="bg-navy-900">Exam Dates Query</option>
                    <option value="mock" className="bg-navy-900">Mock Exam Information</option>
                    <option value="reschedule" className="bg-navy-900">Reschedule/Cancel Exam</option>
                    <option value="facilities" className="bg-navy-900">Facility Information</option>
                    <option value="other" className="bg-navy-900">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="dark-input resize-none"
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full btn-premium py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? (
                    <span className="animate-spin w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      Send Message
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
