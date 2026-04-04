import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EXAMS = ['CMA US', 'CELPIP', 'IELTS', 'TOEFL / GRE', 'ACCA', 'Other'];

export default function EarlyAccessSection({ showToast, onSignupSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', interested_exam: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { full_name, email, phone, interested_exam, password } = form;

    if (!full_name.trim() || !email.trim() || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (!supabase) {
      showToast('Service unavailable. Please email edu@fets.in.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: full_name.trim(),
            phone: phone.trim() || null,
            interested_exam: interested_exam || null,
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      // Also save to early_access_leads so admin panel can see registrations
      await supabase.from('early_access_leads').insert({
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        interested_exam: interested_exam || null,
      }).catch(() => {}); // non-critical

      setDone(true);
      showToast('Account created! You are now logged in.');
      if (onSignupSuccess && data.user) onSignupSuccess(data.user);
    } catch (err) {
      console.error(err);
      if (err.message?.toLowerCase().includes('already registered')) {
        showToast('This email is already registered. Please log in instead.', 'error');
      } else {
        showToast(err.message || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#FFD000]/40 transition-colors';
  const labelCls = 'mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40';

  return (
    <section id="register" className="section-padding bg-[#0f0f0f] border-t border-white/[0.06]">
      <div className="container-custom">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">

          {/* Left: copy */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-4">Early Access</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-normal mb-3 leading-tight">
              First in line.<br />Every time.
            </h2>
            <p className="text-lg text-white/40 font-semibold mb-8 tracking-normal">
              Register once. Get notified first.
            </p>
            <p className="mb-8 leading-relaxed text-white/55">
              Create your free FETS candidate account and get priority access to exam dates the moment they open — before the general public. Especially powerful for CMA US and CELPIP aspirants where seats fill fast.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                'First to know about new exam dates',
                'Priority booking for CMA US & CELPIP mocks',
                'Personal dashboard with exam calendar',
                'Study materials and preparation guides',
                'Exclusive early-bird pricing',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#FFD000]" /> {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8">
            {done ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FFD000]/10 border border-[#FFD000]/30 flex items-center justify-center text-[#FFD000] mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">You're all set!</h3>
                <p className="text-sm text-white/50">Your account has been created. Check your dashboard to explore exam dates and resources.</p>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000]">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Create account</h3>
                    <p className="text-sm text-white/40">Free · No email verification needed</p>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className={labelCls} htmlFor="reg-name">Full name <span className="text-[#FFD000]">*</span></label>
                    <input
                      id="reg-name" type="text" required value={form.full_name}
                      onChange={set('full_name')}
                      className={inputCls} placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-email">Email address <span className="text-[#FFD000]">*</span></label>
                    <input
                      id="reg-email" type="email" required value={form.email}
                      onChange={set('email')}
                      className={inputCls} placeholder="you@email.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-phone">Phone number</label>
                    <input
                      id="reg-phone" type="tel" value={form.phone}
                      onChange={set('phone')}
                      className={inputCls} placeholder="+91 …"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-exam">Interested exam</label>
                    <select
                      id="reg-exam" value={form.interested_exam}
                      onChange={set('interested_exam')}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="" className="bg-[#0f0f0f]">Select an exam</option>
                      {EXAMS.map((ex) => <option key={ex} value={ex} className="bg-[#0f0f0f]">{ex}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-password">Password <span className="text-[#FFD000]">*</span></label>
                    <div className="relative">
                      <input
                        id="reg-password" type={showPw ? 'text' : 'password'} required value={form.password}
                        onChange={set('password')}
                        className={`${inputCls} pr-10`} placeholder="Min. 6 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 w-full rounded-xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.15)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account & Sign In'}
                  </button>
                  <p className="pt-1 text-center text-[10px] leading-relaxed text-white/25">
                    By registering you agree to receive exam date notifications and related updates.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
