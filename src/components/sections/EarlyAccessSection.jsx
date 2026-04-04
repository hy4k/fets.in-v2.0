import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EXAMS = ['CMA US', 'CELPIP', 'IELTS', 'Other'];

export default function EarlyAccessSection({ showToast }) {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const full_name = String(fd.get('full_name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const interested_exam = String(fd.get('interested_exam') || '').trim();
    if (!full_name || !email) {
      showToast('Please enter your name and email.', 'error');
      return;
    }
    if (!supabase) {
      showToast('Registration is not configured. Please email edu@fets.in or call +91 9605686000.', 'error');
      return;
    }
    setPending(true);
    try {
      const { error } = await supabase.from('early_access_leads').insert({
        full_name, email, phone: phone || null, interested_exam: interested_exam || null,
      });
      if (error) throw error;
      showToast("You're on the list. We'll email you when new dates open.");
      e.target.reset();
    } catch (err) {
      console.error(err);
      showToast('Could not save registration. Please email edu@fets.in or call +91 9605686000.', 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <section id="early-access" className="section-padding bg-[#0f0f0f] border-t border-white/[0.06]">
      <div className="container-custom">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-4">Exclusive access</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Get early access to exam dates</h2>
            <p className="mb-8 leading-relaxed text-white/55">
              Register with us to be the first to know about opening dates for exams, especially for CMA US and CELPIP candidates. This service is designed to give you a practical edge in your certification journey.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                'First to know about new exam dates',
                'Exclusive early bird discounts when available',
                'Priority booking for CMA US & CELPIP',
                'Study material and checklist updates',
                'Exam tips and preparation guides',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#FFD000]" /> {benefit}
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#FFD000]/20 bg-[#FFD000]/5 px-4 py-2.5 text-sm font-bold text-[#FFD000]">
              <Star size={14} fill="currentColor" /> Especially for CMA US & CELPIP candidates
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFD000]/10 border border-[#FFD000]/20 text-[#FFD000]">
                <Bell size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Register for updates</h3>
                <p className="text-sm text-white/40">Join our notification list</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40" htmlFor="ea-name">Full name</label>
                <input
                  id="ea-name" name="full_name" type="text" required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#FFD000]/40 transition-colors"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40" htmlFor="ea-email">Email address</label>
                <input
                  id="ea-email" name="email" type="email" required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#FFD000]/40 transition-colors"
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40" htmlFor="ea-phone">Phone number</label>
                <input
                  id="ea-phone" name="phone" type="tel"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#FFD000]/40 transition-colors"
                  placeholder="+91 …"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40" htmlFor="ea-exam">Interested exam</label>
                <select
                  id="ea-exam" name="interested_exam" defaultValue=""
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#FFD000]/40 transition-colors"
                >
                  <option value="" disabled className="bg-[#0f0f0f]">Select an exam</option>
                  {EXAMS.map((ex) => <option key={ex} value={ex} className="bg-[#0f0f0f]">{ex}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="mt-2 h-12 w-full rounded-xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm hover:bg-[#ffe44d] transition-all shadow-[0_8px_24px_rgba(255,208,0,0.15)] disabled:opacity-50"
              >
                {pending ? 'Saving…' : 'Register for exclusive updates'}
              </button>
              <p className="pt-1 text-center text-[10px] leading-relaxed text-white/25">
                By registering, you agree to receive notifications about exam dates and related services.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
