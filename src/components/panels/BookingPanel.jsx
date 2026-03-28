import { useState } from 'react';
import { X, ClipboardList, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

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
      <>
        <div className="panel-overlay" onClick={onClose} />
        <div className="panel-slide">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-teal-400" />
              <h3 className="text-white font-semibold">Booking Submitted</h3>
            </div>
            <button className="panel-close-btn" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="panel-body text-center py-12">
            <div className="w-16 h-16 rounded-full bg-teal-400/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-teal-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Request Received!</h4>
            <p className="text-zinc-400 text-sm mb-4">
              Thank you, <span className="text-white font-medium">{data.name}</span>. Your booking for{' '}
              <span className="text-rose-400 font-medium">{data.exam}</span> has been submitted.
            </p>
            <p className="text-zinc-500 text-xs">We'll confirm your slot within 24 hours.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel-slide">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-rose-400" />
            <h3 className="text-white font-semibold">Book Exam</h3>
          </div>
          <button className="panel-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="panel-body">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? 'bg-rose-400/20 text-rose-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-rose-400/30' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Select Exam *</label>
                <select value={data.exam} onChange={(e) => setData({ ...data, exam: e.target.value })} className="select-dark">
                  {examOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}{o.fee ? ` — ₹${o.fee.toLocaleString()}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Centre</label>
                <div className="flex gap-2">
                  {['Calicut', 'Kochi'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setData({ ...data, location: loc })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                        data.location === loc
                          ? 'bg-rose-400/15 text-rose-300 border border-rose-400/30'
                          : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <MapPin size={14} />{loc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Preferred Date *</label>
                <input type="date" value={data.preferredDate} onChange={(e) => setData({ ...data, preferredDate: e.target.value })} min="2026-03-26" className="input-dark" />
              </div>
              {selectedExam?.fee && (
                <div className="p-3 rounded-lg bg-rose-400/5 border border-rose-400/15">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Estimated Fee</span>
                    <span className="text-gold-300 text-lg font-bold">₹{selectedExam.fee.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Full Name (as on ID) *</label>
                <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="input-dark" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email *</label>
                <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="input-dark" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Phone *</label>
                <input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="input-dark" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">ID Type</label>
                  <select value={data.idType} onChange={(e) => setData({ ...data, idType: e.target.value })} className="select-dark">
                    <option value="Passport">Passport</option>
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">ID Number *</label>
                  <input type="text" value={data.idNumber} onChange={(e) => setData({ ...data, idNumber: e.target.value })} className="input-dark" placeholder="ID number" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium mb-3">Review & Confirm</h4>
              {[
                { l: 'Exam', v: data.exam },
                { l: 'Centre', v: data.location },
                { l: 'Date', v: data.preferredDate },
                { l: 'Name', v: data.name },
                { l: 'Email', v: data.email },
                { l: 'Phone', v: data.phone },
                { l: 'ID', v: `${data.idType}: ${data.idNumber}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-zinc-800/50">
                  <span className="text-zinc-500 text-sm">{item.l}</span>
                  <span className="text-white text-sm font-medium">{item.v}</span>
                </div>
              ))}
              {selectedExam?.fee && (
                <div className="flex justify-between pt-2 mt-2 border-t border-rose-400/15">
                  <span className="text-rose-300 font-medium">Total Fee</span>
                  <span className="text-gold-300 text-lg font-bold">₹{selectedExam.fee.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-zinc-800/50">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-ghost">Back</button>
            ) : <div />}
            <button
              onClick={() => {
                if (step < 3) setStep(step + 1);
                else handleSubmit();
              }}
              className="btn-primary"
            >
              {step === 3 ? 'Submit Booking' : 'Continue'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
