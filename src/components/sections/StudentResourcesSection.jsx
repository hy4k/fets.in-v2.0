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
    <section id="student-resources" className="section-padding border-t border-light-200 bg-light-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <p className="section-label mb-3">Student resources</p>
          <h2 className="section-title mb-4">Exam prep that respects your time</h2>
          <p className="section-lead mx-auto">
            Tips, week-by-week timelines, and printable checklists—curated for candidates sitting professional and English proficiency exams at our centres.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {resourceTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                tag === t
                  ? 'border-accent-500 bg-accent-500 text-white'
                  : 'border-light-300 bg-white text-dark-800 hover:border-accent-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-accent-500" size={22} />
              <h3 className="heading-serif text-xl font-semibold text-dark-950">Exam tips</h3>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tips.length === 0 ? (
                  <p className="text-sm text-dark-800">No tips for this filter—try &quot;All&quot;.</p>
                ) : (
                  tips.map((tip) => (
                    <motion.div
                      key={tip.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-hidden rounded-xl border border-light-300 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                      >
                        <span className="font-semibold text-dark-950">{tip.title}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-dark-800 transition-transform ${expanded === tip.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expanded === tip.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-light-200 px-4 pb-4 text-sm text-dark-800"
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange className="text-accent-500" size={22} />
              <h3 className="heading-serif text-xl font-semibold text-dark-950">Timelines</h3>
            </div>
            <div className="space-y-4">
              {timelines.length === 0 ? (
                <p className="text-sm text-dark-800">No timelines for this filter.</p>
              ) : (
                timelines.map((tl) => (
                  <div key={tl.id} className="rounded-xl border border-light-300 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-accent-600">{tl.examFocus}</p>
                    <h4 className="heading-serif mt-1 text-lg font-semibold text-dark-950">{tl.title}</h4>
                    <ol className="mt-3 space-y-2 border-l-2 border-primary-400/50 pl-4">
                      {tl.steps.map((s, i) => (
                        <li key={i} className="text-sm text-dark-800">
                          <span className="font-semibold text-dark-950">{s.title}</span>
                          <span className="block text-dark-800/90">{s.detail}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <Download className="text-accent-500" size={22} />
              <h3 className="heading-serif text-xl font-semibold text-dark-950">Downloads</h3>
            </div>
            <div className="space-y-3">
              {files.length === 0 ? (
                <p className="text-sm text-dark-800">No downloads for this filter.</p>
              ) : (
                files.map((f) => (
                  <a
                    key={f.id}
                    href={f.href}
                    download
                    className="block rounded-xl border border-light-300 bg-white p-4 shadow-sm transition-all hover:border-accent-400 hover:shadow-md"
                  >
                    <span className="font-semibold text-dark-950">{f.title}</span>
                    <p className="mt-1 text-sm text-dark-800">{f.blurb}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-accent-600">
                      <Download size={14} /> Get file
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
