import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, User, Calendar as CalendarIcon, Clock, BookOpen, CreditCard, Landmark } from "lucide-react";
import { supabase } from "../lib/supabase";

function makeCode() {
  return 'FETS' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CMAMockBookingModal({ isOpen, onClose, mockInfo }) {
  const [flow, setFlow] = useState("direct"); // direct | success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

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
      setFlow("direct");
      setError("");
      setConfirmationCode("");
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

  const handleSubmitDirect = async (e) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone || !preferredDate) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    const code = makeCode();
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
          confirmation_code: code,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      await supabase.from("cma_mock_students").insert({
        booking_id: booking.id,
        student_name: leadName,
      }).catch(() => {});

      setConfirmationCode(code);
      setFlow("success");
    } catch (err) {
      setError(err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderDirectFlow = () => (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h4 className="text-white font-bold text-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000]">
            <User size={20} />
          </div>
          Mock Registration
        </h4>
        <p className="text-white/40 text-sm mt-2 ml-[52px]">{mockInfo?.name || "CMA Mock Exam"}</p>
      </div>

      <form onSubmit={handleSubmitDirect} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Candidate Name</label>
          <input
            type="text"
            required
            value={leadName}
            onChange={e => setLeadName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-medium placeholder:text-white/20 shadow-inner"
            placeholder="Your full legal name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              required
              value={leadEmail}
              onChange={e => setLeadEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-medium placeholder:text-white/20 shadow-inner"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">Phone Number</label>
            <input
              type="tel"
              required
              value={leadPhone}
              onChange={e => setLeadPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-medium placeholder:text-white/20 shadow-inner"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">
            <BookOpen size={12} className="inline mr-1 -mt-0.5" /> Exam Part
          </label>
          <select
            value={examPart}
            onChange={e => setExamPart(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
            style={{ colorScheme: "dark" }}
          >
            <option value="Part 1">CMA Part 1</option>
            <option value="Part 2">CMA Part 2</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">
              <CalendarIcon size={12} className="inline mr-1 -mt-0.5" /> Preferred Date
            </label>
            <input
              type="date"
              required
              value={preferredDate}
              onChange={e => setPreferredDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">
              <Clock size={12} className="inline mr-1 -mt-0.5" /> Session
            </label>
            <select
              value={sessionTime}
              onChange={e => setSessionTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-[#FFD000] transition-colors text-sm font-bold shadow-inner"
              style={{ colorScheme: "dark" }}
            >
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFD000] text-dark-950 rounded-xl py-4 mt-4 font-black hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,208,0,0.25)]"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Registration"}
        </button>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="py-10 text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <CheckCircle2 size={40} />
      </div>
      <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Booking Confirmed!</h4>
      <p className="text-white/40 text-sm mb-6">
        Your request has been recorded. Our team will contact you at <span className="text-white/70 font-semibold">{leadEmail}</span>.
      </p>

      {/* Confirmation code */}
      <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-[#FFD000]/30 bg-[#FFD000]/5 px-6 py-5">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Your Booking Code</p>
        <p className="text-2xl font-black text-[#FFD000] tracking-widest font-mono">{confirmationCode}</p>
        <p className="text-[11px] text-white/30 mt-2">Save this code for reference</p>
      </div>

      <div className="text-xs text-white/30 mb-8 px-2 leading-relaxed">
        A copy of this booking has been sent to your details on file.<br/>
        We will confirm your slot via WhatsApp or call.
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
      >
        Done
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
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all shrink-0 group"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        )}

        <div className="relative z-10">
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
