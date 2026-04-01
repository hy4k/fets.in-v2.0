/** @typedef {{ id: string; title: string; summary: string; body?: string; tags: string[] }} ExamTip */
/** @typedef {{ id: string; title: string; examFocus: string; tags: string[]; weeksOut: number; steps: { title: string; detail: string }[] }} ExamTimeline */
/** @typedef {{ id: string; title: string; blurb: string; href: string; tags: string[] }} DownloadItem */

export const resourceTags = ['All', 'CMA', 'IELTS', 'CELPIP', 'English tests', 'Study skills', 'Exam day'];

/** @type {ExamTip[]} */
export const examTips = [
  {
    id: 'tip-arrive',
    title: 'Arrive calm, leave sharp',
    summary: 'Sleep beats cramming. Aim for 7–8 hours the night before high-stakes tests.',
    body: 'Pack your ID and confirmation the evening before. Eat a light meal, skip excessive caffeine, and plan transit with a 30-minute buffer for Kerala traffic.',
    tags: ['Study skills', 'Exam day'],
  },
  {
    id: 'tip-cma-blocks',
    title: 'CMA: train in exam-length blocks',
    summary: 'Practice 4-hour sessions with one break pattern—matching Prometric conditions.',
    body: 'Use official topic weights. After each block, log misses by domain and revisit only those chapters the next day.',
    tags: ['CMA', 'Study skills'],
  },
  {
    id: 'tip-ielts-time',
    title: 'IELTS: guard your clock',
    summary: 'In Reading, never dwell on one question—mark and move.',
    body: 'Writing needs a plan: 5 minutes outline, then steady paragraphs. Speaking: answer the question first, then extend with one concrete example.',
    tags: ['IELTS', 'English tests'],
  },
  {
    id: 'tip-celpip-format',
    title: 'CELPIP: own the computer format',
    summary: 'Typing under time is a skill—practice in the same keyboard layout as test day.',
    body: 'For Speaking, record crisp answers in the time allowed. Listen once, note keywords, then respond—no perfectionism.',
    tags: ['CELPIP', 'English tests'],
  },
  {
    id: 'tip-anxiety',
    title: 'Breathing beats re-reading',
    summary: 'If anxiety spikes mid-test, pause for three slow breaths before the next item.',
    body: 'It costs seconds but saves minutes of foggy mistakes. Works for Prometric, Pearson, and paper-adjacent setups alike.',
    tags: ['Study skills', 'Exam day'],
  },
  {
    id: 'tip-id-docs',
    title: 'ID and name consistency',
    summary: 'Your registration name must match your ID exactly—check hyphens and order.',
    body: 'Carry the same ID type you used to register. Photocopies are rarely accepted at testing centres.',
    tags: ['Exam day'],
  },
];

/** @type {ExamTimeline[]} */
export const examTimelines = [
  {
    id: 'tl-cma-12',
    title: '12-week CMA sprint',
    examFocus: 'CMA US — either part',
    tags: ['CMA'],
    weeksOut: 12,
    steps: [
      { title: 'Weeks 12–9', detail: 'Complete one full syllabus pass; end each week with 20–30 mixed MCQs.' },
      { title: 'Weeks 8–5', detail: 'Timed topic drills + essay outlines (2 per week) using official style guides.' },
      { title: 'Weeks 4–2', detail: 'Full mock exams weekly; log error patterns; zero weak areas before mocks.' },
      { title: 'Final week', detail: 'Light review, sleep, and one half-length practice—no new topics.' },
    ],
  },
  {
    id: 'tl-ielts-8',
    title: '8-week IELTS band build',
    examFocus: 'IELTS Academic / General',
    tags: ['IELTS', 'English tests'],
    weeksOut: 8,
    steps: [
      { title: 'Weeks 8–6', detail: 'Diagnostic test; daily reading timed sets; speaking recorded and self-reviewed.' },
      { title: 'Weeks 5–4', detail: 'Writing Task 1 + 2 weekly; get feedback on structure, not just grammar.' },
      { title: 'Weeks 3–2', detail: 'Full tests every 3–4 days; track Listening traps (spelling, plurals).' },
      { title: 'Week 1', detail: 'One full mock; vocabulary light review; early nights.' },
    ],
  },
  {
    id: 'tl-celpip-6',
    title: '6-week CELPIP run',
    examFocus: 'CELPIP General',
    tags: ['CELPIP', 'English tests'],
    weeksOut: 6,
    steps: [
      { title: 'Weeks 6–5', detail: 'Familiarize with on-screen format; daily listening + reading sets.' },
      { title: 'Weeks 4–3', detail: 'Writing templates for email/problem; speaking with timer.' },
      { title: 'Weeks 2–1', detail: 'Full simulations; refine typing speed for Writing.' },
    ],
  },
];

/** @type {DownloadItem[]} */
export const downloads = [
  {
    id: 'dl-checklist',
    title: 'Exam day checklist',
    blurb: 'What to pack, when to leave, and last-minute checks before you enter the testing room.',
    href: '/downloads/exam-day-checklist.txt',
    tags: ['Exam day'],
  },
  {
    id: 'dl-weekly-plan',
    title: '12-week study planner',
    blurb: 'Printable weekly grid to block study sessions and mock exams.',
    href: '/downloads/study-plan-weekly.txt',
    tags: ['Study skills', 'CMA'],
  },
  {
    id: 'dl-id-docs',
    title: 'ID & registration alignment',
    blurb: 'Short checklist to ensure your name and documents match test-day requirements.',
    href: '/downloads/id-registration-checklist.txt',
    tags: ['Exam day'],
  },
];

export function filterResourcesByTag(tag, tips, timelines, files) {
  if (!tag || tag === 'All') {
    return { tips, timelines, files };
  }
  const match = (tags) => tags.includes(tag);
  return {
    tips: tips.filter((t) => match(t.tags)),
    timelines: timelines.filter((t) => match(t.tags)),
    files: files.filter((f) => match(f.tags)),
  };
}
