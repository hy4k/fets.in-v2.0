import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, ArrowRight, Building2, User, KeyRound, Calendar as CalendarIcon, Clock, BookOpen, CreditCard, Landmark, Users } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function CMAMockBookingModal({ isOpen, onClose, mockInfo }) {
  const [flow, setFlow] = useState("choice"); // choice, direct, institutional, success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Institutional Data
  const [accessCode, setAccessCode] = useState("");
  const [coachingCenter, setCoachingCenter] = useState(null);
  const [studentCount, setStudentCount] = useState(1);
  const [studentNames, setStudentNames] = useState([""]);
  
  // Shared Data
  const [examPart, setExamPart] = useState("Part 1");
  const [preferredDate, setPreferredDate] = useState("");
  const [sessionTime, setSessionTime] = useState("Morning (9:00 AM)");
  const [paymentMethod, setPaymentMethod] = useState("online");

  // Direct Data
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFlow("choice");
      setStep(1);
      setError("");
      // Reset forms
      setAccessCode("");
      setCoachingCenter(null);
      setStudentCount(1);
      setStudentNames([""]);
      setExamPart("Part 1");
      setPreferredDate("");
      setSessionTime("Morning (9:00 AM)");
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setPaymentMethod("online");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyCode = async () => {
    if (!accessCode.trim()) {
      setError("Please enter an access code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("coaching_centers")
        .select("*")
        .eq("access_code", accessCode.trim())
        .single();
      
      if (error || !data) {
        throw new Error("Invalid access code.");
      }
      setCoachingCenter(data);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to verify code.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCountChange = (value) => {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 1) return;
    setStudentCount(count);
    setStudentNames((prev) => {
      const newNames = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) newNames.push("");
      } else if (count < prev.length) {
        newNames.length = count;
      }
      return newNames;
    });
  };

  const updateStudentName = (index, name) => {
    const newNames = [...studentNames];
    newNames[index] = name;
    setStudentNames(newNames);
  };

  const handleSubmitInstitutional = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("cma_mock_bookings")
        .insert({
          booking_type: "institutional",
          coaching_center_id: coachingCenter.id,
          exam_part: examPart,
          preferred_date: preferredDate,
          session_time: sessionTime,
          payment_method: paymentMethod,
          student_count: studentCount,
        })
        .select()
        .single();
        
      if (bookingError) throw bookingError;

      const studentRecords = studentNames.map(name => ({
        booking_id: booking.id,
        student_name: name || "Unknown Student"
      }));

      const { error: studentError } = await supabase
        .from("cma_mock_students")
        .insert(studentRecords);
        
      if (studentError) throw studentError;

      setFlow("success");
    } catch (err) {
      setError(err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDirect = async (e) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone || !preferredDate) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("cma_mock_bookings")
        .insert({
          booking_type: "direct",
          lead_name: leadName,
          lead_email: leadEmail,
          lead_phone: leadPhone,
          exam_part: examPart,
          preferred_date: preferredDate,
          session_time: sessionTime,
          payment_method: paymentMethod,
          student_count: 1,
        })
        .select()
        .single();
        
      if (bookingError) throw bookingError;

      const { error: studentError } = await supabase
        .from("cma_mock_students")
        .insert({
          booking_id: booking.id,
          student_name: leadName
        });
        
      if (studentError) throw studentError;

      setFlow("success");
    } catch (err) {
      setError(err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderChoice = () => (
    <div className="space-y-6 text-center animate-fade-in-up">
      <div className="mb-8">
        <h4 className="text-white font-bold text-2xl mb-2 tracking-tight">Welcome to {mockInfo?.name || "CMA Mock"} Booking</h4>
        <p className="text-white/50 text-sm">Please select your booking type to continue.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => { setFlow("direct"); setStep(1); }}
          className="group p-6 rounded-2xl bg-dark-900 border border-white/10 hover:border-[#FFD000]/50 hover:bg-dark-800 transition-all flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-14 h-14 rounded-full bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] relative z-10 shadow-[inset_0_2px_10px_rgba(255,208,0,0.1)]">
            <User size={26} />
          </div>
          <div className="relative z-10">
            <h5 className="font-bold text-white text-lg mb-1">Direct Candidate</h5>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Booking a mock test for yourself individually.</p>
          </div>
        </button>

        <button 
          onClick={() => { setFlow("institutional"); setStep(1); }}
          className="group p-6 rounded-2xl bg-dark-900 border border-white/10 hover:border-blue-500/50 hover:bg-dark-800 transition-all flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 relative z-10 shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)]">
            <Building2 size={26} />
          </div>
          <div className="relative z-10">
            <h5 className="font-bold text-white text-lg mb-1">Coaching Center</h5>
            <p className="text-xs text-white/40 leading-relaxed font-medium">Booking in bulk for multiple students.</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderInstitutionalFlow = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <button onClick={() => setFlow("choice")} className="text-xs font-bold uppercase tracking-widest text-[#FFD000] hover:text-[#ffe44d] mb-8 flex items-center gap-1.5 transition-colors">
            &larr; Back to options
          </button>
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-dark-900 border border-blue-500/20 p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <KeyRound size={80} />
            </div>
            <h4 className="text-white font-bold text-xl mb-2 flex items-center gap-2 relative z-10">
               Center Verification
            </h4>
            <p className="text-white/50 text-sm relative z-10">Securely authenticate using your partner access code.</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <input 
                type="text" 
                value={accessCode} 
                onChange={e => setAccessCode(e.target.value)} 
                placeholder="Enter Access Code (e.g. FETS-CMA-2026)" 
                className="w-full px-4 py-4 rounded-xl bg-dark-950 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold text-center tracking-widest uppercase shadow-inner"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.2)]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify Access Code"}
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-[#FFD000] hover:text-[#ffe44d] mb-6 flex items-center gap-1.5 transition-colors">
          &larr; Back
        </button>
        
        <div className="mb-8 p-5 bg-dark-900 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> Verified Partner
            </p>
            <h4 className="font-bold text-white tracking-wide">{coachingCenter?.name}</h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Building2 size={18} />
          </div>
        </div>
        
        <form onSubmit={handleSubmitInstitutional} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Students Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={studentCount}
                onChange={(e) => handleStudentCountChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
              />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Exam Part</label>
               <select
                 value={examPart}
                 onChange={(e) => setExamPart(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
               >
                 <option value="Part 1">CMA Part 1</option>
                 <option value="Part 2">CMA Part 2</option>
               </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 max-h-52 overflow-y-auto custom-scrollbar">
            <label className="block text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest sticky top-0 bg-dark-900 py-1 z-10">Candidate Roster</label>
            {studentNames.map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#FFD000]/60 w-6 opacity-70">{i+1}.</span>
                <input
                  type="text"
                  required
                  placeholder="Student Full Name"
                  value={name}
                  onChange={(e) => updateStudentName(i, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-950 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD000] transition-colors placeholder:text-white/20"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
             <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest"><CalendarIcon size={12} className="inline mr-1 -mt-0.5" /> Date</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
                style={{ colorScheme: 'dark' }}
              />
             </div>
             <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest"><Clock size={12} className="inline mr-1 -mt-0.5" /> Session</label>
              <select
                 value={sessionTime}
                 onChange={(e) => setSessionTime(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
               >
                 <option value="Morning (9:00 AM)">Morning (9:00 AM)</option>
                 <option value="Noon (1:00 PM)">Noon (1:00 PM)</option>
               </select>
             </div>
          </div>

          <div className="pt-2">
             <label className="block text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest">Payment Settlement</label>
             <div className="grid grid-cols-2 gap-3">
               <label className={`cursor-pointer border py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${paymentMethod === 'online' ? 'bg-[#FFD000]/10 border-[#FFD000]/50 text-[#FFD000] shadow-[0_0_15px_rgba(255,208,0,0.1)]' : 'bg-dark-950 border-white/10 text-white/50 hover:bg-dark-900'}`}>
                 <input type="radio" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="sr-only" />
                 <CreditCard size={18} /> Online
               </label>
               <label className={`cursor-pointer border py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${paymentMethod === 'pay_direct' ? 'bg-[#FFD000]/10 border-[#FFD000]/50 text-[#FFD000] shadow-[0_0_15px_rgba(255,208,0,0.1)]' : 'bg-dark-950 border-white/10 text-white/50 hover:bg-dark-900'}`}>
                 <input type="radio" value="pay_direct" checked={paymentMethod === 'pay_direct'} onChange={() => setPaymentMethod('pay_direct')} className="sr-only" />
                 <Landmark size={18} /> Pay Directly
               </label>
             </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD000] text-dark-950 rounded-xl py-4 mt-2 font-black hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,208,0,0.2)]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Bulk Booking"}
          </button>
        </form>
      </div>
    );
  };

  const renderDirectFlow = () => {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setFlow("choice")} className="text-xs font-bold uppercase tracking-widest text-[#FFD000] hover:text-[#ffe44d] mb-6 flex items-center gap-1.5 transition-colors">
          &larr; Back to options
        </button>
        
        <div className="mb-8">
          <h4 className="text-white font-bold text-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000]">
              <User size={20} />
            </div>
            Mock Registration
          </h4>
        </div>

        <form onSubmit={handleSubmitDirect} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Candidate Name</label>
            <input type="text" required value={leadName} onChange={e => setLeadName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-medium placeholder:text-white/20 shadow-inner" placeholder="Your full legal name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Email Address</label>
              <input type="email" required value={leadEmail} onChange={e => setLeadEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-medium placeholder:text-white/20 shadow-inner" placeholder="your@email.com" />
             </div>
             <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Phone Number</label>
              <input type="tel" required value={leadPhone} onChange={e => setLeadPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-medium placeholder:text-white/20 shadow-inner" placeholder="+91 XXXXX XXXXX" />
             </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest"><BookOpen size={12} className="inline mr-1 -mt-0.5" /> Exam Part</label>
             <select value={examPart} onChange={e => setExamPart(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner" style={{ colorScheme: "dark" }}>
               <option value="Part 1">CMA Part 1</option>
               <option value="Part 2">CMA Part 2</option>
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest"><CalendarIcon size={12} className="inline mr-1 -mt-0.5" /> Date</label>
              <input type="date" required value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner" style={{ colorScheme: "dark" }} />
             </div>
             <div>
              <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest"><Clock size={12} className="inline mr-1 -mt-0.5" /> Session</label>
              <select value={sessionTime} onChange={e => setSessionTime(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner" style={{ colorScheme: "dark" }}>
                 <option value="Morning (9:00 AM)">Morning (9:00 AM)</option>
                 <option value="Noon (1:00 PM)">Noon (1:00 PM)</option>
               </select>
             </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <label className="block text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest">Payment Method</label>
             <div className="grid grid-cols-2 gap-3">
               <label className={`cursor-pointer border py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${paymentMethod === 'online' ? 'bg-[#FFD000]/10 border-[#FFD000]/50 text-[#FFD000] shadow-[0_0_15px_rgba(255,208,0,0.1)]' : 'bg-dark-950 border-white/10 text-white/50 hover:bg-dark-900'}`}>
                 <input type="radio" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="sr-only" />
                 <CreditCard size={18} /> Online Pay
               </label>
               <label className={`cursor-pointer border py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${paymentMethod === 'pay_at_center' ? 'bg-[#FFD000]/10 border-[#FFD000]/50 text-[#FFD000] shadow-[0_0_15px_rgba(255,208,0,0.1)]' : 'bg-dark-950 border-white/10 text-white/50 hover:bg-dark-900'}`}>
                 <input type="radio" value="pay_at_center" checked={paymentMethod === 'pay_at_center'} onChange={() => setPaymentMethod('pay_at_center')} className="sr-only" />
                 <Landmark size={18} /> At Center
               </label>
             </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#FFD000] text-dark-950 rounded-xl py-4 mt-4 font-black hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,208,0,0.25)]">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Registration"}
          </button>
        </form>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="py-12 text-center animate-fade-in-up">
      <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <CheckCircle2 size={48} />
      </div>
      <h4 className="text-3xl font-black text-white mb-4 tracking-tight">Booking Confirmed!</h4>
      <p className="text-white/50 font-medium mb-10 max-w-[280px] mx-auto leading-relaxed text-sm">
        Your CMA Mock Test request has been successfully recorded. Our team will coordinate the next steps with you.
      </p>
      <button onClick={onClose} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all shadow-md">
        Return to Home
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-dark-900/90 rounded-[2rem] p-6 md:p-8 max-w-lg w-full relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar ring-1 ring-white/5 backdrop-blur-xl" 
        onClick={e => e.stopPropagation()}
      >
        {flow !== "success" && (
          <div className="flex items-center justify-between mb-4 sticky top-0 z-20 bg-dark-900/90 backdrop-blur-md -mt-2 -mx-2 p-2 rounded-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000] text-[10px] font-black rounded-full uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD000] animate-pulse"></div> Mock Exam Simulator
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all shrink-0 group">
              <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        )}
        
        <div className="relative z-10">
          {flow === "choice" && renderChoice()}
          {flow === "institutional" && renderInstitutionalFlow()}
          {flow === "direct" && renderDirectFlow()}
          {flow === "success" && renderSuccess()}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD000]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
}
