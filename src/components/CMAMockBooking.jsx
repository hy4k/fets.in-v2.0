import { useState, useEffect } from 'react';
import {
  X, MapPin, Clock, CheckCircle, Loader2,
  ChevronLeft, ChevronRight, ArrowRight, ArrowLeft,
  User, Mail, Phone, Building2, Tag, CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const STEPS = ['Center', 'Date', 'Slot', 'Details', 'Payment'];
const EXAM_PRICE = 2500;

export default function CMAMockBooking({ isOpen, onClose, showToast }) {
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null); // 'Part 1' | 'Part 2'
  const [form, setForm] = useState({ name: '', email: '', mobile: '', institute: '' });
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('center');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  const discount = couponApplied
    ? couponApplied.discount_type === 'percentage'
      ? Math.round(EXAM_PRICE * couponApplied.discount_value / 100)
      : Number(couponApplied.discount_value)
    : 0;
  const finalPrice = Math.max(0, EXAM_PRICE - discount);

  useEffect(() => {
    if (!selectedCenter || step !== 2) return;
    fetchAvailableDates();
  }, [selectedCenter, step]);

  useEffect(() => {
    if (!selectedDate || !selectedCenter || step !== 3) return;
    fetchAvailableSlots();
  }, [selectedDate, selectedCenter, step]);

  const fetchAvailableDates = async () => {
    if (!supabase) {
      setLoadingDates(false);
      showToast('Booking service is unavailable. Please call +91 9605686000.', 'error');
      return;
    }
    setLoadingDates(true);
    setAvailableDates([]);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mock_exam_slots')
        .select('date, total_seats, booked_seats')
        .eq('center', selectedCenter)
        .gte('date', today);

      if (error) throw error;
      const dates = [...new Set(
        data.filter(d => d.total_seats - d.booked_seats > 0).map(d => d.date)
      )];
      setAvailableDates(dates);
    } catch {
      showToast('Could not load available dates. Please try again.', 'error');
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!supabase) {
      setLoadingSlots(false);
      showToast('Booking service is unavailable. Please call +91 9605686000.', 'error');
      return;
    }
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const { data, error } = await supabase
        .from('mock_exam_slots')
        .select('*')
        .eq('center', selectedCenter)
        .eq('date', selectedDate)
        .order('time_slot');

      if (error) throw error;
      setAvailableSlots(data.filter(s => s.total_seats - s.booked_seats > 0));
    } catch {
      showToast('Could not load time slots. Please try again.', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!supabase) {
      setCouponError('Coupon validation unavailable. Call +91 9605686000.');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) { setCouponError('Invalid or expired coupon code.'); return; }
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setCouponError('This coupon has expired.');
        return;
      }
      if (data.max_uses != null && data.used_count >= data.max_uses) {
        setCouponError('This coupon has reached its usage limit.');
        return;
      }
      setCouponApplied(data);
      showToast('Coupon applied!', 'success');
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !form.name || !form.email || !form.mobile) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!supabase) {
      showToast('Booking service is unavailable. Please call +91 9605686000.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { data: booking, error: bookingError } = await supabase
        .from('mock_exam_bookings')
        .insert({
          slot_id: selectedSlot.id,
          candidate_name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          institute: form.institute.trim() || null,
          part: selectedPart,
          coupon_code: couponApplied?.code || null,
          original_price: EXAM_PRICE,
          discount_amount: discount,
          final_price: finalPrice,
          payment_status: 'pending',
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Increment booked seats
      await supabase.rpc('increment_booked_seats', { p_slot_id: selectedSlot.id });

      // Increment coupon used_count if applied
      if (couponApplied) {
        await supabase
          .from('coupon_codes')
          .update({ used_count: couponApplied.used_count + 1 })
          .eq('id', couponApplied.id);
      }

      if (paymentMethod === 'online') {
        initiateRazorpay(booking.id);
      } else {
        setBookingDone(true);
      }
    } catch (err) {
      console.error(err);
      showToast('Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const initiateRazorpay = (bookingId) => {
    if (!window.Razorpay) {
      showToast('Payment gateway not loaded. Please try "Pay at Center".', 'error');
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount: finalPrice * 100,
      currency: 'INR',
      name: 'FETS — CMA US Mock Exam',
      description: `${selectedSlot.part} | ${selectedCenter} | ${formatDate(selectedDate)}`,
      prefill: { name: form.name, email: form.email, contact: form.mobile },
      theme: { color: '#FFC000' },
      handler: async (response) => {
        if (!supabase) return;
        await supabase
          .from('mock_exam_bookings')
          .update({
            payment_status: 'paid',
            payment_reference: response.razorpay_payment_id,
          })
          .eq('id', bookingId);
        setBookingDone(true);
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCenter(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedPart(null);
    setAvailableDates([]);
    setAvailableSlots([]);
    setForm({ name: '', email: '', mobile: '', institute: '' });
    setCouponCode('');
    setCouponApplied(null);
    setCouponError('');
    setPaymentMethod('center');
    setBookingDone(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const canProceed = () => {
    if (step === 1) return !!selectedCenter;
    if (step === 2) return !!selectedDate;
    if (step === 3) return !!(selectedSlot && selectedPart);
    if (step === 4) return !!(form.name && form.email && form.mobile);
    return true;
  };

  // Calendar helpers
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const formatDate = (str) =>
    str ? new Date(str + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const renderCalendarCells = () => {
    const cells = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDay(currentMonth);

    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const y = currentMonth.getFullYear();
      const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${y}-${m}-${dd}`;
      const isPast = new Date(dateStr + 'T00:00:00') < today;
      const isAvailable = availableDates.includes(dateStr);
      const isSelected = selectedDate === dateStr;

      cells.push(
        <button
          key={d}
          disabled={isPast || !isAvailable}
          onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
          className={`w-9 h-9 rounded-full text-sm font-medium transition-all mx-auto flex items-center justify-center
            ${isSelected ? 'bg-primary-400 text-dark-950 font-bold shadow' :
              isAvailable && !isPast ? 'bg-primary-400/15 text-dark-950 hover:bg-primary-400/30 cursor-pointer' :
              'text-gray-300 cursor-not-allowed'}`}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-light-50 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-light-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-light-200 shrink-0">
          <div>
            <h2 className="heading-serif text-2xl font-semibold text-dark-950">CMA US Mock Exam</h2>
            {!bookingDone && (
              <p className="text-xs text-dark-800 mt-0.5">
                Step {step} of {STEPS.length} — <span className="font-semibold text-primary-600">{STEPS[step - 1]}</span>
              </p>
            )}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-light-200 rounded-full transition-colors">
            <X size={18} className="text-dark-800" />
          </button>
        </div>

        {/* Progress bar */}
        {!bookingDone && (
          <div className="px-7 pt-3 pb-1 shrink-0">
            <div className="flex gap-1">
              {STEPS.map((s, i) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-primary-400' : 'bg-light-300'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-7 py-5">

          {/* SUCCESS STATE */}
          {bookingDone && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary-400/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-primary-500" />
              </div>
              <h3 className="heading-serif text-2xl font-semibold text-dark-950 mb-2">Booking Confirmed!</h3>
              <p className="text-dark-800 text-sm mb-6">
                Your CMA US Mock Exam has been booked. A confirmation will be sent to <strong>{form.email}</strong>.
              </p>
              <div className="bg-light-100 border border-light-200 rounded-2xl p-5 text-left space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-dark-800">Part</span><span className="font-semibold text-dark-950">{selectedPart}</span></div>
                <div className="flex justify-between"><span className="text-dark-800">Center</span><span className="font-semibold text-dark-950">{selectedCenter}</span></div>
                <div className="flex justify-between"><span className="text-dark-800">Date</span><span className="font-semibold text-dark-950">{formatDate(selectedDate)}</span></div>
                <div className="flex justify-between"><span className="text-dark-800">Time</span><span className="font-semibold text-dark-950">{selectedSlot?.time_slot}</span></div>
                <div className="flex justify-between"><span className="text-dark-800">Amount</span><span className="font-bold text-primary-600">₹{finalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-dark-800">Payment</span>
                  <span className={`font-semibold ${paymentMethod === 'online' ? 'text-green-600' : 'text-dark-950'}`}>
                    {paymentMethod === 'online' ? 'Paid Online' : 'Pay at Center'}
                  </span>
                </div>
              </div>
              <button onClick={handleClose} className="btn-primary w-full">Done</button>
            </div>
          )}

          {/* STEP 1 — SELECT CENTER */}
          {!bookingDone && step === 1 && (
            <div>
              <h3 className="font-semibold text-dark-950 mb-1">Select Test Center</h3>
              <p className="text-sm text-dark-800 mb-5">Choose your preferred FETS location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'Cochin', addr: '6th Floor, Manjooran Estate, Edappally, Kochi' },
                  { id: 'Calicut', addr: '4th Floor, Kadooli Tower, West Nadakkavu, Calicut' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCenter(c.id); setSelectedDate(null); setSelectedSlot(null); }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      selectedCenter === c.id
                        ? 'border-primary-400 bg-primary-400/5 shadow-sm'
                        : 'border-light-200 hover:border-primary-400/40 bg-light-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className={selectedCenter === c.id ? 'text-primary-500' : 'text-dark-800'} />
                      <span className="font-bold text-dark-950">{c.id} Centre</span>
                    </div>
                    <p className="text-xs text-dark-800 leading-relaxed">{c.addr}</p>
                    {selectedCenter === c.id && (
                      <div className="mt-3 flex items-center gap-1 text-primary-600 text-xs font-semibold">
                        <CheckCircle size={13} /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — SELECT DATE */}
          {!bookingDone && step === 2 && (
            <div>
              <h3 className="font-semibold text-dark-950 mb-1">Select Exam Date</h3>
              <p className="text-sm text-dark-800 mb-5">Highlighted dates have available seats — {selectedCenter} Centre</p>

              {loadingDates ? (
                <div className="flex justify-center items-center py-14">
                  <Loader2 size={28} className="animate-spin text-primary-500" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-light-200 rounded-full transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-semibold text-dark-950 text-sm">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-light-200 rounded-full transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-dark-800 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1">
                    {renderCalendarCells()}
                  </div>

                  <div className="flex items-center gap-5 mt-4 text-xs text-dark-800">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary-400/20 border border-primary-400/40 inline-block" /> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary-400 inline-block" /> Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-light-300 inline-block" /> Not available</span>
                  </div>

                  {!loadingDates && availableDates.length === 0 && (
                    <p className="text-center text-sm text-dark-800 mt-6 py-4 bg-light-100 rounded-xl border border-light-200">
                      No available dates at {selectedCenter} right now. Please check back later.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3 — SELECT SLOT + PART */}
          {!bookingDone && step === 3 && (
            <div>
              <h3 className="font-semibold text-dark-950 mb-1">Select Time Slot &amp; Exam Part</h3>
              <p className="text-sm text-dark-800 mb-5">
                {selectedCenter} — {formatDate(selectedDate)}
              </p>

              {loadingSlots ? (
                <div className="flex justify-center items-center py-14">
                  <Loader2 size={28} className="animate-spin text-primary-500" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-center text-sm text-dark-800 mt-6 py-4 bg-light-100 rounded-xl border border-light-200">
                  No slots available for this date. Please go back and select a different date.
                </p>
              ) : (
                <div className="space-y-5">
                  {/* Time slots */}
                  <div>
                    <p className="text-xs font-bold text-dark-800 uppercase tracking-wider mb-2">Session</p>
                    <div className="space-y-3">
                      {availableSlots.map(slot => {
                        const seatsLeft = slot.total_seats - slot.booked_seats;
                        const isSelected = selectedSlot?.id === slot.id;
                        const label = slot.time_slot === '9:00 AM' ? 'Morning Session' : 'Afternoon Session';
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-primary-400 bg-primary-400/5 shadow-sm'
                                : 'border-light-200 hover:border-primary-400/40 bg-light-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary-400 text-dark-950' : 'bg-light-200 text-dark-800'}`}>
                                  <Clock size={17} />
                                </div>
                                <div>
                                  <div className="font-bold text-dark-950 text-sm">{slot.time_slot} — {label}</div>
                                  <div className="text-xs text-dark-800 mt-0.5">
                                    {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available
                                  </div>
                                </div>
                              </div>
                              {isSelected && <CheckCircle size={18} className="text-primary-500 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part selection — shown after a slot is chosen */}
                  {selectedSlot && (
                    <div>
                      <p className="text-xs font-bold text-dark-800 uppercase tracking-wider mb-2">Exam Part</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Part 1', 'Part 2'].map(part => (
                          <button
                            key={part}
                            onClick={() => setSelectedPart(part)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedPart === part
                                ? 'border-primary-400 bg-primary-400/5 shadow-sm'
                                : 'border-light-200 hover:border-primary-400/40 bg-light-100'
                            }`}
                          >
                            <div className="font-bold text-dark-950 text-sm">{part}</div>
                            <div className="text-xs text-dark-800 mt-0.5">
                              {part === 'Part 1'
                                ? 'Financial Planning, Performance & Analytics'
                                : 'Strategic Financial Management'}
                            </div>
                            {selectedPart === part && (
                              <div className="mt-2 flex items-center gap-1 text-primary-600 text-xs font-semibold">
                                <CheckCircle size={12} /> Selected
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — CANDIDATE DETAILS */}
          {!bookingDone && step === 4 && (
            <div>
              <h3 className="font-semibold text-dark-950 mb-1">Candidate Details</h3>
              <p className="text-sm text-dark-800 mb-5">Enter your information for the booking confirmation</p>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark-950 mb-1.5">
                    <User size={13} /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="input-clean"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark-950 mb-1.5">
                    <Mail size={13} /> Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="input-clean"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark-950 mb-1.5">
                    <Phone size={13} /> Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="input-clean"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-dark-950 mb-1.5">
                    <Building2 size={13} /> Institute Name
                  </label>
                  <input
                    type="text"
                    value={form.institute}
                    onChange={e => setForm({ ...form, institute: e.target.value })}
                    placeholder="Your college / institute (optional)"
                    className="input-clean"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — PAYMENT */}
          {!bookingDone && step === 5 && (
            <div>
              <h3 className="font-semibold text-dark-950 mb-1">Review & Payment</h3>
              <p className="text-sm text-dark-800 mb-5">Confirm your booking details and complete payment</p>

              {/* Booking summary */}
              <div className="bg-light-100 border border-light-200 rounded-2xl p-5 mb-5">
                <p className="text-[10px] font-bold text-dark-800 uppercase tracking-wider mb-3">Booking Summary</p>
                <div className="space-y-2 text-sm">
                  {[
                    ['Exam', 'CMA US Mock Exam'],
                    ['Part', selectedPart],
                    ['Center', selectedCenter],
                    ['Date', formatDate(selectedDate)],
                    ['Time', selectedSlot?.time_slot],
                    ['Candidate', form.name],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-dark-800">{label}</span>
                      <span className="font-semibold text-dark-950">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-light-200 mt-3 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-800">Exam Fee</span>
                    <span className="font-semibold text-dark-950">₹{EXAM_PRICE.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({couponApplied.code})</span>
                      <span>− ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-light-200 pt-2 mt-1">
                    <span className="text-dark-950">Total</span>
                    <span className="text-primary-600">₹{finalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-dark-950 mb-1.5">
                  <Tag size={13} /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                      if (!e.target.value) setCouponApplied(null);
                    }}
                    placeholder="Enter coupon code"
                    className="input-clean flex-1"
                    disabled={!!couponApplied}
                  />
                  {couponApplied ? (
                    <button
                      onClick={() => { setCouponApplied(null); setCouponCode(''); setCouponError(''); }}
                      className="px-4 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="px-4 rounded-lg bg-dark-950 text-primary-400 text-sm font-semibold hover:bg-dark-800 transition-colors disabled:opacity-40 whitespace-nowrap"
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                {couponApplied && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Saving ₹{discount.toLocaleString()} with {couponApplied.code}
                  </p>
                )}
              </div>

              {/* Payment method */}
              <div className="mb-6">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-dark-950 mb-2">
                  <CreditCard size={13} /> Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'online', label: 'Pay Online', desc: 'Razorpay — UPI, Card, Net Banking', icon: '💳' },
                    { id: 'center', label: 'Pay at Center', desc: 'Pay cash / card on exam day', icon: '🏢' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === m.id
                          ? 'border-primary-400 bg-primary-400/5'
                          : 'border-light-200 hover:border-primary-400/30 bg-light-100'
                      }`}
                    >
                      <div className="text-lg mb-1">{m.icon}</div>
                      <div className="font-semibold text-sm text-dark-950">{m.label}</div>
                      <div className="text-xs text-dark-800 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full h-12 text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {submitting ? (
                  <><Loader2 size={17} className="animate-spin" /> Processing...</>
                ) : paymentMethod === 'online' ? (
                  <><CreditCard size={17} /> Pay ₹{finalPrice.toLocaleString()}</>
                ) : (
                  <><CheckCircle size={17} /> Confirm Booking</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!bookingDone && (
          <div className="px-7 py-4 border-t border-light-200 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                if (step === 1) handleClose();
                else setStep(step - 1);
              }}
              className="flex items-center gap-1.5 text-dark-800 font-semibold text-sm hover:text-dark-950 transition-colors"
            >
              <ArrowLeft size={15} /> {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 5 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Continue <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
