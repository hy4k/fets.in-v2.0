// Exam categories and their details
export const examCategories = [];

// Exam dates
export const examDates = [];

/** Map calendar slot exam label to BookingPanel exam `value` */
export function slotExamToBookingValue(exam) {
  const map = {
    'CMA US': 'CMA US Part 1',
    'CELPIP General': 'CELPIP General',
    'IELTS Academic': 'IELTS Academic',
    'TOEFL iBT': 'TOEFL iBT',
    'GRE General': 'GRE General',
    ACCA: 'ACCA',
    'MRCS Part A': 'MRCS Part A',
    AWS: 'AWS Cloud',
    Microsoft: 'Microsoft',
  };
  return map[exam] ?? 'IELTS Academic';
}

// Mock exam data
export const mockExams = [];

// Testimonials
export const testimonials = [];

// FAQ data
export const faqData = [];

// Centers data
export const centers = [];
