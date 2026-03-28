import { X, BookOpen, Clock, FileQuestion, ArrowRight, CheckCircle } from 'lucide-react';
import { mockExams } from '../../data/siteData';

export default function MockExamPanel({ onClose, onBook }) {
  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel-slide">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-rose-400" />
            <h3 className="text-white font-semibold">Mock Exams</h3>
          </div>
          <button className="panel-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="panel-body">
          <img src="/images/facility/calicut-reception.jpg" alt="FETS Centre" className="panel-image mb-5" />
          <p className="text-zinc-400 text-sm mb-5">Practice in real exam conditions. Choose a mock test below:</p>

          <div className="space-y-3">
            {mockExams.map((mock) => (
              <div key={mock.id} className="data-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{mock.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mock.difficulty === 'Advanced' ? 'bg-rose-400/15 text-rose-300' :
                    mock.difficulty === 'Intermediate' ? 'bg-gold-300/15 text-gold-300' :
                    'bg-teal-400/15 text-teal-300'
                  }`}>{mock.difficulty}</span>
                </div>

                <p className="text-zinc-500 text-xs mb-3 line-clamp-2">{mock.description}</p>

                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={11} /> {mock.duration}</span>
                  <span className="flex items-center gap-1"><FileQuestion size={11} /> {mock.questions}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {mock.features.slice(0, 3).map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <CheckCircle size={10} className="text-teal-400" />{f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                  <span className="text-gold-300 font-bold">₹{mock.price.toLocaleString()}</span>
                  <button
                    onClick={() => onBook(mock)}
                    className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                  >
                    Book <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
