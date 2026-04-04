import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CalendarRange, Download, ChevronDown } from 'lucide-react';
import {
  resourceTags,
  examTips,
  examTimelines,
  downloads,
  filterResourcesByTag,
} from '../../data/studentResources';

export default function StudentResourcesSection() {
  const [tag, setTag] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const { tips, timelines, files } = useMemo(
    () => filterResourcesByTag(tag, examTips, examTimelines, downloads),
    [tag],
  );

  return (
    <section id="student-resources" className="section-padding bg-[#0f0f0f] border-t border-white/[0.06]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFD000] mb-3">Student resources</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Exam prep that respects your time</h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto leading-relaxed">
            Tips, week-by-week timelines, and printable checklists—curated for candidates sitting professional and English proficiency exams at our centres.
          </p>
        </motion.div>

        {/* Tag filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {resourceTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                tag === t
                  ? 'border-[#FFD000] bg-[#FFD000] text-[#0a0a0a]'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Exam tips */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-[#FFD000]" size={20} />
              <h3 className="text-lg font-black text-white">Exam tips</h3>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {tips.length === 0 ? (
                  <p className="text-sm text-white/40">No tips for this filter—try "All".</p>
                ) : (
                  tips.map((tip) => (
                    <motion.div
                      key={tip.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]"
                    >
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                      >
                        <span className="font-semibold text-white/90 text-sm">{tip.title}</span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-white/30 transition-transform ${expanded === tip.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expanded === tip.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/[0.06] px-4 pb-4 text-sm text-white/50"
                          >
                            <p className="pt-3">{tip.summary}</p>
                            {tip.body && <p className="mt-2 leading-relaxed">{tip.body}</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Timelines */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange className="text-[#FFD000]" size={20} />
              <h3 className="text-lg font-black text-white">Timelines</h3>
            </div>
            <div className="space-y-4">
              {timelines.length === 0 ? (
                <p className="text-sm text-white/40">No timelines for this filter.</p>
              ) : (
                timelines.map((tl) => (
                  <div key={tl.id} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD000]">{tl.examFocus}</p>
                    <h4 className="mt-1 text-base font-bold text-white">{tl.title}</h4>
                    <ol className="mt-3 space-y-2 border-l-2 border-[#FFD000]/30 pl-4">
                      {tl.steps.map((s, i) => (
                        <li key={i} className="text-sm text-white/60">
                          <span className="font-semibold text-white/90">{s.title}</span>
                          <span className="block text-white/50">{s.detail}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Downloads */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-4 flex items-center gap-2">
              <Download className="text-[#FFD000]" size={20} />
              <h3 className="text-lg font-black text-white">Downloads</h3>
            </div>
            <div className="space-y-3">
              {files.length === 0 ? (
                <p className="text-sm text-white/40">No downloads for this filter.</p>
              ) : (
                files.map((f) => (
                  <a
                    key={f.id}
                    href={f.href}
                    download
                    className="block rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 transition-all hover:border-[#FFD000]/25 hover:bg-white/[0.06]"
                  >
                    <span className="font-semibold text-white/90">{f.title}</span>
                    <p className="mt-1 text-sm text-white/50">{f.blurb}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#FFD000]">
                      <Download size={12} /> Get file
                    </span>
                  </a>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
