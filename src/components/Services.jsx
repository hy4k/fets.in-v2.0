import { Calendar, Bell, BookOpen, UserCheck, Shield, Headphones, Monitor, MapPin } from 'lucide-react';

const services = [
  {
    icon: Calendar,
    title: 'Check Exam Dates',
    desc: 'Browse available exam dates across all certification programs. Filter by exam type, location, and availability in real-time.',
    href: '#exam-dates',
    highlight: true,
  },
  {
    icon: Bell,
    title: 'Early Access Registration',
    desc: 'Register to receive exclusive early notifications when new exam dates open, especially for CMA US and CELPIP candidates.',
    href: '#register',
    highlight: true,
  },
  {
    icon: BookOpen,
    title: 'Book Through FETS',
    desc: 'Book your exam slot directly through us. We handle the process, ensure seat availability, and provide booking confirmation.',
    href: '#book-exam',
    highlight: true,
  },
  {
    icon: Monitor,
    title: 'Mock Examinations',
    desc: 'Practice in real exam conditions with our mock tests. Available for CMA US, CELPIP, IELTS, TOEFL, GRE, and more.',
    href: '#mock-exams',
    highlight: true,
  },
  {
    icon: Shield,
    title: 'Secure Testing Environment',
    desc: 'Biometric verification, CCTV monitoring, individual workstations, and locker facilities for a completely secure exam experience.',
    href: '#gallery',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'Our team is available 7 days a week to help with exam queries, technical issues, scheduling, and exam-day support.',
    href: '#contact',
  },
  {
    icon: UserCheck,
    title: 'Prometric & Pearson VUE',
    desc: 'Official authorized center for both Prometric and Pearson VUE, covering medical, IT, academic, and professional certifications.',
    href: '#services',
  },
  {
    icon: MapPin,
    title: 'Two Premium Locations',
    desc: 'State-of-the-art testing centers in Calicut and Kochi, both well-connected and designed for candidate comfort.',
    href: '#contact',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-semibold tracking-[0.15em] uppercase">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            Everything You Need, <span className="gradient-text font-serif">One Platform</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From checking available dates to booking exams to practicing with mocks — we've built an end-to-end experience for certification candidates.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <a
              key={i}
              href={s.href}
              className={`group glass-card rounded-2xl p-6 transition-all duration-300 hover:border-gold-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/5 ${
                s.highlight ? 'ring-1 ring-gold-500/20 bg-gold-500/[0.03]' : ''
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  s.highlight
                    ? 'bg-gold-500/15 text-gold-400 group-hover:bg-gold-500/25'
                    : 'bg-white/5 text-gray-400 group-hover:text-gold-400 group-hover:bg-gold-500/10'
                }`}
              >
                <s.icon size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-gold-400 transition-colors">
                {s.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              {s.highlight && (
                <div className="mt-4 inline-flex items-center text-gold-400 text-sm font-medium">
                  Explore <span className="ml-1 group-hover:ml-2 transition-all">&rarr;</span>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
