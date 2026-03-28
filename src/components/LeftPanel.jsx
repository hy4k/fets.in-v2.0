import { useMemo, useRef, useEffect } from 'react';
import { Calendar, MapPin, Phone, ArrowRight, Zap } from 'lucide-react';
import { examDates, centers } from '../data/siteData';

const examInfo = [
  { id: 'cma', name: 'CMA US', cat: 'Accounting', desc: 'Certified Management Accountant', fee: '₹15,000', tagColor: 'bg-rose-400/15 text-rose-300' },
  { id: 'celpip', name: 'CELPIP', cat: 'Immigration', desc: 'Canadian English Proficiency', fee: '₹12,000', tagColor: 'bg-peach-400/15 text-peach-300' },
  { id: 'ielts', name: 'IELTS', cat: 'English', desc: 'International English Testing', fee: '₹16,500', tagColor: 'bg-gold-300/15 text-gold-300' },
  { id: 'toefl', name: 'TOEFL iBT', cat: 'English', desc: 'Test of English as Foreign Language', fee: '₹13,500', tagColor: 'bg-gold-300/15 text-gold-300' },
  { id: 'gre', name: 'GRE General', cat: 'Graduate', desc: 'Graduate Record Examination', fee: '₹22,000', tagColor: 'bg-teal-400/15 text-teal-300' },
  { id: 'acca', name: 'ACCA', cat: 'Accounting', desc: 'Chartered Certified Accountants', fee: '₹8,500', tagColor: 'bg-rose-400/15 text-rose-300' },
  { id: 'mrcs', name: 'MRCS Part A', cat: 'Medical', desc: 'Royal College of Surgeons', fee: '₹25,000', tagColor: 'bg-peach-400/15 text-peach-300' },
  { id: 'aws', name: 'AWS', cat: 'IT Cert', desc: 'Amazon Web Services', fee: '₹5,000', tagColor: 'bg-teal-400/15 text-teal-300' },
  { id: 'microsoft', name: 'Microsoft', cat: 'IT Cert', desc: 'Microsoft Certification', fee: '₹5,000', tagColor: 'bg-teal-400/15 text-teal-300' },
];

const partners = [
  { name: 'Prometric', logo: '/images/logos/prometric.png' },
  { name: 'Pearson VUE', logo: '/images/logos/pearson-vue.png' },
  { name: 'CELPIP', logo: '/images/logos/celpip.jpg' },
  { name: 'CMA USA', logo: '/images/logos/cma-usa.png' },
  { name: 'PSI', logo: '/images/logos/psi.png' },
];

export default function LeftPanel({ highlightedExam, onExamClick, onLocationClick }) {
  const examRefs = useRef({});

  // Auto-scroll to highlighted exam
  useEffect(() => {
    if (highlightedExam && examRefs.current[highlightedExam]) {
      examRefs.current[highlightedExam].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedExam]);

  // Compute next date for each exam
  const nextDates = useMemo(() => {
    const map = {};
    examInfo.forEach((ex) => {
      const slot = examDates.find(
        (d) => d.exam.toLowerCase().includes(ex.id) && d.status !== 'booked'
      );
      map[ex.id] = slot
        ? new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;
    });
    return map;
  }, []);

  const availableSlots = examDates.filter((d) => d.status !== 'booked').length;

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <img src="/images/logos/forun-logo.png" alt="FETS" className="h-8 w-auto brightness-0 invert opacity-80 mb-3" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          Kerala's premier testing centre for Prometric, Pearson VUE & more.
        </p>
      </div>

      {/* Stats */}
      <div className="lp-section">
        <div className="lp-stats">
          <div className="lp-stat">
            <div className="lp-stat-value">{examInfo.length}</div>
            <div className="lp-stat-label">Exams</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value">2</div>
            <div className="lp-stat-label">Centres</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value">{availableSlots}</div>
            <div className="lp-stat-label">Open Slots</div>
          </div>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="lp-section">
        <div className="lp-section-title"><Zap size={11} /> Exams We Offer</div>
        <div className="grid grid-cols-2 gap-2">
          {examInfo.map((exam) => (
            <div
              key={exam.id}
              ref={(el) => (examRefs.current[exam.id] = el)}
              className={`exam-card ${highlightedExam === exam.id ? 'highlighted' : ''}`}
              onClick={() => onExamClick(exam.id, exam.name)}
            >
              <span className="exam-card-ask">Ask AI →</span>
              <span className={`exam-card-tag ${exam.tagColor}`}>{exam.cat}</span>
              <div className="exam-card-name">{exam.name}</div>
              <div className="exam-card-desc">{exam.desc}</div>
              <div className="exam-card-meta">
                <span className="text-zinc-500">
                  {nextDates[exam.id] ? (
                    <span className="flex items-center gap-1"><Calendar size={10} />{nextDates[exam.id]}</span>
                  ) : (
                    'On demand'
                  )}
                </span>
                <span className="text-zinc-400 font-semibold">{exam.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Centres */}
      <div className="lp-section">
        <div className="lp-section-title"><MapPin size={11} /> Our Centres</div>
        <div className="grid grid-cols-2 gap-2">
          {centers.map((c) => (
            <div key={c.id} className="location-card" onClick={() => onLocationClick(c.id)}>
              {c.images?.[0] && <img src={c.images[0]} alt={c.name} />}
              <div className="location-card-body">
                <h4 className="text-white text-sm font-semibold mb-0.5">{c.name.replace(' Centre', '')}</h4>
                <p className="text-zinc-500 text-[11px] leading-snug mb-1.5 line-clamp-2">{c.address}</p>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-[11px] text-rose-400">
                  <Phone size={9} />{c.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="lp-section">
        <div className="lp-section-title">Authorized Partners</div>
        <div className="partner-strip">
          {partners.map((p, i) => (
            <img key={i} src={p.logo} alt={p.name} title={p.name} />
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="text-center py-2">
        <a href="tel:+919605686000" className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <Phone size={12} />+91 9605686000
        </a>
        <span className="mx-2 text-zinc-700">·</span>
        <a href="mailto:edu@fets.in" className="text-xs text-zinc-500 hover:text-rose-400 transition-colors">edu@fets.in</a>
      </div>
    </>
  );
}
