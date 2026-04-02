import { X, BookOpen, Clock, FileQuestion, ArrowRight, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { mockExams } from '../../data/siteData';

export default function MockExamPanel({ onClose, onBook }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] border border-[#FFD000]/20">
               <BookOpen size={20} />
             </div>
             <div>
               <h3 className="modal-title">Mock Simulations</h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Real Exam Environment</p>
             </div>
          </div>
          <button className="skeuo-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="relative rounded-3xl overflow-hidden mb-8 group border border-white/5 shadow-2xl">
            <img 
              src="/images/facility/calicut-reception.jpg" 
              alt="FETS Centre" 
              className="w-full h-48 object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-[#FFD000]" />
                <span className="text-[10px] font-black text-[#FFD000] uppercase tracking-widest">Authenticated Centre</span>
              </div>
              <h4 className="text-xl font-black text-white tracking-tight">Professional Practice Sessions</h4>
              <p className="text-white/40 text-xs font-medium">Full AI-integrated simulation with detailed response analytics.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockExams.map((mock) => (
              <div key={mock.id} className="card-premium flex flex-col h-full border border-white/5 hover:border-[#FFD000]/30 transition-all group overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                   <div className="p-3 rounded-xl bg-[#FFD000]/5 border border-[#FFD000]/10 group-hover:bg-[#FFD000]/20 group-hover:scale-110 transition-all">
                     <Zap size={18} className="text-[#FFD000]" />
                   </div>
                   <span className={`text-[9px] font-black px-3 py-1 rounded-full border tracking-widest uppercase transition-colors ${
                     mock.difficulty === 'Advanced' ? 'bg-rose-400/5 text-rose-400 border-rose-400/20 group-hover:bg-rose-400 group-hover:text-dark-950' :
                     mock.difficulty === 'Intermediate' ? 'bg-[#FFD000]/5 text-[#FFD000] border-[#FFD000]/20 group-hover:bg-[#FFD000] group-hover:text-dark-950' :
                     'bg-emerald-400/5 text-emerald-400 border-emerald-400/20 group-hover:bg-emerald-400 group-hover:text-dark-950'
                   }`}>{mock.difficulty}</span>
                </div>

                <div className="flex-1">
                  <h4 className="text-white font-black text-sm mb-2 group-hover:text-[#FFD000] transition-colors tracking-tight">{mock.name}</h4>
                  <p className="text-[11px] leading-relaxed text-white/30 font-medium line-clamp-2 mb-4">{mock.description}</p>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-white/5 mb-4">
                   <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                     <Clock size={12} className="text-white/40" /> {mock.duration}
                   </div>
                   <div className="flex-1 h-px bg-white/5" />
                   <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                     <FileQuestion size={12} className="text-white/40" /> {mock.questions} Qs
                   </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <div>
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1 leading-none">Session Fee</p>
                     <span className="text-[#FFD000] text-lg font-black leading-none">₹{mock.price.toLocaleString()}</span>
                   </div>
                   <button
                     onClick={() => onBook(mock)}
                     className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#FFD000] hover:text-dark-950 hover:border-transparent transition-all flex items-center gap-2 group/btn shadow-md"
                   >
                     Book <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
