import ExamDatesPanel from './panels/ExamDatesPanel';
import BookingPanel from './panels/BookingPanel';
import MockExamPanel from './panels/MockExamPanel';
import ContactPanel from './panels/ContactPanel';
import { slotExamToBookingValue } from '../data/siteData';

/**
 * Slide-in panels opened from EXAM ASSIST. `activePanel` matches AgentChatOverlay `openPanel` values.
 */
export default function ChatPanels({
  activePanel,
  onClose,
  bookingPrefill,
  bookingKey,
  onNavigateToBooking,
  onOpenCmaMock,
  showToast,
}) {
  if (!activePanel) return null;

  switch (activePanel) {
    case 'exam-dates':
      return (
        <ExamDatesPanel
          onClose={onClose}
          onBookSlot={(slot) => {
            onNavigateToBooking({
              exam: slotExamToBookingValue(slot.exam),
              location: slot.location,
              date: slot.date,
            });
          }}
        />
      );
    case 'booking':
      return (
        <BookingPanel
          key={bookingKey}
          onClose={onClose}
          prefill={bookingPrefill}
          onSubmit={() => {
            showToast('Booking request received. Our team will confirm within 24 hours.');
            onClose();
          }}
        />
      );
    case 'mock-exams':
      return (
        <MockExamPanel
          onClose={onClose}
          onBook={(mock) => {
            if (mock.category === 'CMA US') {
              onClose();
              onOpenCmaMock();
            } else {
              showToast('Call +91 9605686000 or use the calendar to book this mock.');
            }
          }}
        />
      );
    case 'contact':
      return <ContactPanel onClose={onClose} />;
    default:
      return null;
  }
}
