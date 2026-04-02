import { useState } from 'react';
import { X, ClipboardList, MapPin, ArrowRight, CheckCircle, User, Mail, Phone, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

const examOptions = [
  { value: '', label: 'Select an exam...' },
  { value: 'CMA US Part 1', label: 'CMA US Part 1', fee: 15000 },
  { value: 'CMA US Part 2', label: 'CMA US Part 2', fee: 15000 },
  { value: 'CELPIP General', label: 'CELPIP General', fee: 12000 },
  { value: 'CELPIP LS', label: 'CELPIP LS', fee: 9000 },
  { value: 'IELTS Academic', label: 'IELTS Academic', fee: 16500 },
  { value: 'IELTS General', label: 'IELTS General Training', fee: 16500 },
  { value: 'TOEFL iBT', label: 'TOEFL iBT', fee: 13500 },
  { value: 'GRE General', label: 'GRE General Test', fee: 22000 },
  { value: 'ACCA', label: 'ACCA Examination', fee: 8500 },
  { value: 'MRCS Part A', label: 'MRCS Part A', fee: 25000 },
  { value: 'AWS Cloud', label: 'AWS Cloud Practitioner', fee: 5000 },
  { value: 'Microsoft', label: 'Microsoft Certification', fee: 5000 },
];

export default function BookingPanel({ onClose, onSubmit, prefill }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    exam: prefill?.exam || '',
    location: prefill?.location || 'Calicut',
    preferredDate: prefill?.date || '',
    name: '',
    email: '',
    phone: '',
    idType: 'Passport',
    idNumber: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedExam = examOptions.find((e) => e.value === data.exam);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit?.(data);
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content !max-w-md text-center py-12 px-8" onClick={e => e.stopPropagation()}>
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle size={48} className="text-emerald-400" />
          </div>
          <h4 className="text-3xl font-black text-white mb-4 tracking-tight">Booking Received</h4>
          <p className="text-white/50 font-medium mb-10 leading-relaxed text-sm">
            Thank you, <span className="text-white">{data.name}</span>. Your request for <span className="text-[#FFD000]">{data.exam}</span> has been securely transmitted. Our team will verify and confirm your slot within 24 hours.
          </p>
          <button onClick={onClose} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all shadow-md">
            Close & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] border border-[#FFD000]/20">
               <ClipboardList size={20} />
             </div>
             <div>
               <h3 className="modal-title">Exam Enrollment</h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Step {step} of 3</p>
             </div>
          </div>
          <button className="skeuo-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body pb-0">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-10 overflow-hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  step === s ? 'bg-[#FFD000] text-dark-950 shadow-[0_0_15px_rgba(255,208,0,0.3)]' : 
                  step > s ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'
                }`}>
                  {step > s ? <CheckCircle size={16} /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > s ? 'bg-emerald-500/30' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          <div className="animate-fade-in-up">
            {step === 1 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 shadow-inner-gold mb-6">
                   <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                     <Calendar size={18} className="text-[#FFD000]" /> Select Schedule
                   </h4>
                   <div className="space-y-5">
                      <div>
                        <label className="label-premium">Testing Program</label>
                        <select 
                          value={data.exam} 
                          onChange={(e) => setData({ ...data, exam: e.target.value })} 
                          className="input-premium appearance-none"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                        >
                          {examOptions.map((o) => (
                            <option key={o.value} value={o.value} className="bg-dark-950">{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label-premium">Preferred Date</label>
                          <input 
                            type="date" 
                            value={data.preferredDate} 
                            onChange={(e) => setData({ ...data, preferredDate: e.target.value })} 
                            className="input-premium"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                        <div>
                          <label className="label-premium">Test Centre</label>
                          <div className="flex p-1 rounded-xl bg-black border border-white/5">
                            {['Calicut', 'Kochi'].map((loc) => (
                              <button
                                key={loc}
                                onClick={() => setData({ ...data, location: loc })}
                                className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                                  data.location === loc
                                    ? 'bg-[#FFD000] text-dark-950 shadow-md'
                                    : 'text-white/30 hover:text-white/60'
                                }`}
                              >
                                {loc}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                {selectedExam?.fee && (
                   <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FFD000]/5 border border-[#FFD000]/10">
                     <div>
                       <p className="text-[10px] font-bold text-[#FFD000]/60 uppercase tracking-widest mb-1">Estimated Exam Fee</p>
                       <span className="text-white font-medium text-xs opacity-60">Payable during confirmation</span>
                     </div>
                     <span className="text-[#FFD000] text-2xl font-black">₹{selectedExam.fee.toLocaleString()}</span>
                   </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <User size={18} className="text-[#FFD000]" /> Candidate Information
                  </h4>
                  <div className="space-y-5">
                    <div>
                      <label className="label-premium">Full Legal Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="input-premium pl-12" placeholder="As shown on your ID" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-premium">Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                          <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="input-premium pl-12" placeholder="your@email.com" />
                        </div>
                      </div>
                      <div>
                        <label className="label-premium">Phone Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                          <input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="input-premium pl-12" placeholder="+91..." />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-premium">Identify Type</label>
                        <select value={data.idType} onChange={(e) => setData({ ...data, idType: e.target.value })} className="input-premium">
                          <option value="Passport" className="bg-dark-950">Passport</option>
                          <option value="Aadhar" className="bg-dark-950">Aadhar Card</option>
                          <option value="DL" className="bg-dark-950">Driving License</option>
                        </select>
                      </div>
                      <div>
                        <label className="label-premium">ID Document Number</label>
                        <div className="relative">
                          <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                          <input type="text" value={data.idNumber} onChange={(e) => setData({ ...data, idNumber: e.target.value })} className="input-premium pl-12" placeholder="Enter ID number" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                   <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                     <ShieldCheck size={18} className="text-[#FFD000]" /> Review & Authorize
                   </h4>
                   <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden divide-y divide-white/5 shadow-inner">
                      {[
                        { l: 'Exam Program', v: data.exam },
                        { l: 'Testing Centre', v: `${data.location} Centre` },
                        { l: 'Preferred Date', v: data.preferredDate },
                        { l: 'Candidate', v: data.name },
                        { l: 'Identification', v: `${data.idType}: ${data.idNumber}` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4">
                          <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{item.l}</span>
                          <span className="text-sm font-bold text-white tracking-tight">{item.v}</span>
                        </div>
                      ))}
                      {selectedExam?.fee && (
                        <div className="flex justify-between items-center p-5 bg-[#FFD000]/5">
                          <span className="text-xs font-black text-[#FFD000] uppercase tracking-[0.2em]">Total Exam Fee</span>
                          <span className="text-xl font-black text-white">₹{selectedExam.fee.toLocaleString()}</span>
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-2">
                  <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={12} className="text-blue-400" />
                  </div>
                  <p className="text-[10px] leading-relaxed text-white/40 font-medium">
                    By submitting, I authorize FETS to process my registration data for the purpose of exam slot allocation and communication.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 pt-4 flex gap-4">
          {step > 1 && (
             <button onClick={() => setStep(step - 1)} className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center">
               Back
             </button>
          )}
          <button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSubmit();
            }}
            className="flex-[2] h-14 rounded-2xl bg-[#FFD000] text-dark-950 font-black hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,208,0,0.2)]"
          >
            {step === 3 ? 'Finalize Booking' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
