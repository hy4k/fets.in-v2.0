import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Sparkles, Star } from 'lucide-react';
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
      showToast(
        'Registration is not configured on this server yet. Please email edu@fets.in or call +91 9605686000.',
        'error',
      );
      return;
    }
    setPending(true);
    try {
      const { error } = await supabase.from('early_access_leads').insert({
        full_name,
        email,
        phone: phone || null,
        interested_exam: interested_exam || null,
      });
      if (error) throw error;
      showToast("You're on the list. We'll email you when new dates open.");
      e.target.reset();
    } catch (err) {
      console.error(err);
      showToast(
        'We could not save your registration. Please email edu@fets.in or call +91 9605686000.',
        'error',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section id="early-access" className="section-padding bg-[#f4ece0]">
      <div className="container-custom">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h4 className="text-overline mb-3 text-primary-600">Exclusive access</h4>
            <h2 className="heading-serif mb-6 text-4xl font-semibold text-dark-950 md:text-5xl">Get early access to exam dates</h2>
            <p className="mb-8 leading-relaxed text-dark-800">
              Register with us to be the first to know about opening dates for exams, especially for CMA US and CELPIP candidates. This service is designed to give you a practical edge in your certification journey.
            </p>
            <ul className="mb-8 space-y-4">
              {[
                'First to know about new exam dates',
                'Exclusive early bird discounts when available',
                'Priority booking for CMA US & CELPIP',
                'Study material and checklist updates',
                'Exam tips and preparation guides',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-dark-950">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary-500" /> {item}
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary-400/10 px-4 py-2 text-sm font-bold text-primary-600">
              <Star size={16} fill="currentColor" className="text-primary-600" /> Especially for CMA US & CELPIP candidates
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-light-300 bg-white p-8 shadow-xl"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-400 text-dark-950">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="heading-serif text-2xl font-bold text-dark-950">Register for updates</h3>
                <p className="text-sm text-dark-800">Join our notification list</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block pl-1 text-sm font-semibold text-dark-950" htmlFor="ea-name">
                  Full name
                </label>
                <input id="ea-name" name="full_name" type="text" required className="input-clean" placeholder="Your full name" autoComplete="name" />
              </div>
              <div>
                <label className="mb-1.5 block pl-1 text-sm font-semibold text-dark-950" htmlFor="ea-email">
                  Email address
                </label>
                <input id="ea-email" name="email" type="email" required className="input-clean" placeholder="you@email.com" autoComplete="email" />
              </div>
              <div>
                <label className="mb-1.5 block pl-1 text-sm font-semibold text-dark-950" htmlFor="ea-phone">
                  Phone number
                </label>
                <input id="ea-phone" name="phone" type="tel" className="input-clean" placeholder="+91 …" autoComplete="tel" />
              </div>
              <div>
                <label className="mb-1.5 block pl-1 text-sm font-semibold text-dark-950" htmlFor="ea-exam">
                  Interested exam
                </label>
                <select id="ea-exam" name="interested_exam" className="input-clean cursor-pointer" defaultValue="">
                  <option value="" disabled>
                    Select an exam
                  </option>
                  {EXAMS.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
                <p className="mt-1 flex items-center gap-1 pl-1 text-[10px] text-dark-800">
                  <Sparkles size={10} className="text-primary-500" /> Priority notification exams
                </p>
              </div>
              <button type="submit" disabled={pending} className="btn-primary mt-2 h-12 w-full text-base font-bold shadow-sm hover:shadow-lg disabled:opacity-60">
                {pending ? 'Saving…' : 'Register for exclusive updates'}
              </button>
              <p className="px-4 pt-2 text-center text-[10px] leading-relaxed text-dark-800">
                By registering, you agree to receive notifications about exam dates and related services. You can unsubscribe at any time.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
