import { Calendar, BookOpen, ClipboardList, MapPin, HelpCircle, Sparkles } from 'lucide-react';

const defaultActions = [
  { label: 'Check Exam Dates', intent: 'exam_dates', icon: Calendar },
  { label: 'Book an Exam', intent: 'book_exam', icon: ClipboardList },
  { label: 'Mock Tests', intent: 'mock_exams', icon: BookOpen },
  { label: 'Our Locations', intent: 'contact', icon: MapPin },
  { label: 'FAQs', intent: 'faq', icon: HelpCircle },
];

export default function QuickActions({ actions, onAction }) {
  const items = actions || defaultActions;

  return (
    <div className="quick-actions">
      {items.map((action, i) => {
        const Icon = action.icon || Sparkles;
        return (
          <button
            key={i}
            className="quick-chip"
            onClick={() => onAction(action.intent, action.label)}
          >
            <Icon size={14} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
