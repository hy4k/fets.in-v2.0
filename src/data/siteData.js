// Exam categories and their details
export const examCategories = [
  {
    id: 'prometric',
    name: 'Prometric',
    shortDesc: 'Medical, IT & Professional Certifications',
    color: '#4c6ef5',
    exams: ['CMA US', 'USMLE', 'MRCS', 'PLAB', 'HAAD', 'DHA', 'MOH', 'OMSB'],
  },
  {
    id: 'pearsonvue',
    name: 'Pearson VUE',
    shortDesc: 'IT, Academic & Professional Exams',
    color: '#10b981',
    exams: ['Microsoft', 'AWS', 'Cisco', 'CompTIA', 'Oracle', 'GMAT', 'GED'],
  },
  {
    id: 'ielts',
    name: 'IELTS',
    shortDesc: 'International English Language Testing',
    color: '#ef4444',
    exams: ['IELTS Academic', 'IELTS General Training'],
  },
  {
    id: 'ets',
    name: 'ETS',
    shortDesc: 'TOEFL, GRE & Educational Testing',
    color: '#8b5cf6',
    exams: ['TOEFL iBT', 'GRE General', 'GRE Subject'],
  },
  {
    id: 'celpip',
    name: 'CELPIP',
    shortDesc: 'Canadian English Proficiency Test',
    color: '#f59e0b',
    exams: ['CELPIP General', 'CELPIP LS'],
  },
  {
    id: 'cma',
    name: 'CMA US',
    shortDesc: 'Certified Management Accountant',
    color: '#c8a415',
    exams: ['CMA Part 1', 'CMA Part 2'],
  },
  {
    id: 'acca',
    name: 'ACCA',
    shortDesc: 'Association of Chartered Certified Accountants',
    color: '#06b6d4',
    exams: ['ACCA Applied Knowledge', 'ACCA Applied Skills', 'ACCA Strategic Professional'],
  },
  {
    id: 'mrcs',
    name: 'MRCS',
    shortDesc: 'Membership of the Royal Colleges of Surgeons',
    color: '#ec4899',
    exams: ['MRCS Part A', 'MRCS Part B'],
  },
];

// Generate sample exam dates for the next 3 months
const generateDates = () => {
  const dates = [];
  const now = new Date(2026, 2, 25); // March 25, 2026
  const examTypes = ['CMA US', 'CELPIP General', 'IELTS Academic', 'TOEFL iBT', 'GRE General', 'ACCA', 'MRCS Part A', 'AWS', 'Microsoft'];
  const locations = ['Calicut', 'Kochi'];
  const statuses = ['available', 'available', 'available', 'limited', 'limited', 'booked'];

  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Skip Sundays sometimes
    if (date.getDay() === 0 && Math.random() > 0.3) continue;
    
    const numExams = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numExams; j++) {
      const exam = examTypes[Math.floor(Math.random() * examTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const slots = status === 'booked' ? 0 : status === 'limited' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 8) + 3;
      
      dates.push({
        id: `exam-${i}-${j}`,
        date: date.toISOString().split('T')[0],
        exam,
        location,
        status,
        slots,
        time: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'][Math.floor(Math.random() * 5)],
        fee: exam.includes('CMA') ? 15000 : exam.includes('CELPIP') ? 12000 : exam.includes('IELTS') ? 16500 : exam.includes('TOEFL') ? 13500 : exam.includes('GRE') ? 22000 : exam.includes('ACCA') ? 8500 : exam.includes('MRCS') ? 25000 : 5000,
      });
    }
  }
  return dates;
};

export const examDates = generateDates();

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
export const mockExams = [
  {
    id: 'mock-cma1',
    name: 'CMA US Mock Test',
    category: 'CMA US',
    description: 'Full-length practice test covering Financial Planning, Performance, and Analytics. Simulates actual Prometric exam environment.',
    duration: '4 hours',
    questions: '100 MCQs + 2 Essays',
    price: 2500,
    difficulty: 'Advanced',
    features: ['Real exam simulation', 'Detailed performance analysis', 'Expert feedback session', 'Study plan recommendations'],
  },
  {
    id: 'mock-cma2',
    name: 'CMA Part 2 Mock Exam',
    category: 'CMA US',
    description: 'Complete practice test for Strategic Financial Management. Computer-based testing format matching real exam.',
    duration: '4 hours',
    questions: 100,
    price: 2500,
    difficulty: 'Advanced',
    features: ['100 MCQs + 2 Essays', 'Detailed explanations', 'Performance analytics', 'Timed like real exam'],
  },
  {
    id: 'mock-celpip-g',
    name: 'CELPIP Mock Test',
    category: 'CELPIP',
    description: 'Practice all 4 components: Listening, Reading, Writing, and Speaking in authentic test conditions.',
    duration: '3 hours',
    questions: 'Listening, Reading, Writing, Speaking',
    price: 2000,
    difficulty: 'Intermediate',
    features: ['Full test simulation', 'Speaking practice with feedback', 'Writing evaluation', 'Score estimate'],
  },
  {
    id: 'mock-celpip-ls',
    name: 'CELPIP LS Mock Test',
    category: 'CELPIP',
    description: 'Focused Listening and Speaking practice test for CELPIP-LS candidates.',
    duration: '1.5 hours',
    questions: 'Full Test',
    price: 800,
    difficulty: 'Intermediate',
    features: ['Listening component', 'Speaking component', 'Real test format', 'Score estimation'],
  },
  {
    id: 'mock-ielts',
    name: 'IELTS Mock Test',
    category: 'IELTS',
    description: 'Comprehensive practice test with all four modules in exam conditions.',
    duration: '2h 45min',
    questions: 'All 4 modules',
    price: 1800,
    difficulty: 'Intermediate',
    features: ['Academic/General options', 'Band score estimate', 'Detailed feedback', 'Improvement tips'],
  },
  {
    id: 'mock-toefl',
    name: 'TOEFL iBT Mock Test',
    category: 'TOEFL',
    description: 'Simulated TOEFL iBT experience with all four sections and automated scoring.',
    duration: '3 hours',
    questions: 'Full Test',
    price: 1000,
    difficulty: 'Intermediate',
    features: ['Reading, Listening, Speaking, Writing', 'Score estimation', 'Section-wise analysis', 'Integrated tasks'],
  },
  {
    id: 'mock-gre',
    name: 'GRE General Mock Test',
    category: 'GRE',
    description: 'Practice the Verbal Reasoning, Quantitative Reasoning, and Analytical Writing sections.',
    duration: '3 hrs 45 min',
    questions: 'Full Test',
    price: 1500,
    difficulty: 'Advanced',
    features: ['Verbal + Quant + AWA', 'Adaptive difficulty', 'Score prediction', 'Detailed analytics'],
  },
  {
    id: 'mock-aws',
    name: 'AWS Cloud Practitioner Mock',
    category: 'AWS',
    description: 'Practice test for AWS Cloud Practitioner certification covering cloud concepts and services.',
    duration: '90 min',
    questions: 65,
    price: 800,
    difficulty: 'Beginner',
    features: ['65 practice questions', 'Domain-wise scoring', 'Explanation for each answer', 'Pass/fail prediction'],
  },
];

// Testimonials
export const testimonials = [
  {
    name: 'Arun Kumar',
    role: 'CMA US Candidate',
    text: 'FETS provided an excellent testing environment. The staff was professional and helpful. I felt completely at ease during my Prometric exam. Highly recommended!',
    rating: 5,
    avatar: 'AK',
  },
  {
    name: 'Priya Menon',
    role: 'IELTS Test Taker',
    text: 'The facilities at FETS are world-class. Clean, comfortable, and equipped with the latest technology. My IELTS experience was smooth from start to finish.',
    rating: 5,
    avatar: 'PM',
  },
  {
    name: 'Rahul Sharma',
    role: 'AWS Certified',
    text: 'Exceptional service! The booking process was seamless, and the support team was available whenever I needed help. Successfully completed my AWS certification here.',
    rating: 5,
    avatar: 'RS',
  },
  {
    name: 'Fathima Zahra',
    role: 'CELPIP Candidate',
    text: 'Being able to check exam dates and book through FETS saved me so much time. The mock exam prepared me perfectly for the real CELPIP test. Got my target score!',
    rating: 5,
    avatar: 'FZ',
  },
  {
    name: 'Dr. Vishnu Nair',
    role: 'MRCS Part A',
    text: 'The private testing booths are excellent. Zero distractions during my MRCS exam. The biometric verification process was quick and professional.',
    rating: 5,
    avatar: 'VN',
  },
  {
    name: 'Sneha Thomas',
    role: 'ACCA Student',
    text: 'I registered for early notifications and got access to exam dates before anyone else. Booked my preferred slot easily. The whole experience was premium.',
    rating: 5,
    avatar: 'ST',
  },
];

// FAQ data
export const faqData = [
  {
    q: 'What ID do I need to bring for my exam?',
    a: "You'll need a valid government-issued photo ID (passport, driver's license, or Aadhar card) and your exam confirmation email. Some exams may have additional requirements - please check your exam provider's guidelines.",
  },
  {
    q: 'How early should I arrive before my exam?',
    a: 'We recommend arriving at least 30 minutes before your scheduled exam time. This allows time for check-in procedures, biometric verification, and familiarization with the testing environment.',
  },
  {
    q: 'Can I reschedule or cancel my exam?',
    a: "Yes, you can reschedule or cancel your exam according to your exam provider's policy. Please note that cancellation and rescheduling fees may apply. Contact us or your exam provider at least 24-48 hours before your scheduled exam.",
  },
  {
    q: 'What items are prohibited in the testing room?',
    a: 'Personal belongings such as mobile phones, smartwatches, bags, study materials, and electronic devices are not allowed in the testing room. We provide secure lockers for storing your belongings during the exam.',
  },
  {
    q: 'When will I receive my exam results?',
    a: 'Result delivery time varies by exam provider. Some exams provide immediate unofficial results, while others may take several days to weeks. Check with your specific exam provider for exact timelines.',
  },
  {
    q: 'Do you offer mock tests?',
    a: 'Yes! We offer mock test facilities for CMA US, CELPIP, IELTS, TOEFL, GRE, and more. Mock tests simulate the actual exam environment so you can practice under real conditions. Visit our Mock Exams section to book.',
  },
  {
    q: 'How does the early access registration work?',
    a: "When you register with FETS, you'll receive exclusive early notifications when new exam dates become available, especially for CMA US and CELPIP. This gives you a head start to book your preferred dates and times before they fill up.",
  },
  {
    q: 'What are the testing center locations?',
    a: 'We have two state-of-the-art centers: one in Calicut (West Nadakkavu, 4th Floor, Kadooli Tower) and one in Kochi (Edappally, 6th Floor, Manjooran Estate). Both centers are well-connected by public transport.',
  },
];

// Centers data
export const centers = [
  {
    id: 'calicut',
    name: 'Calicut Centre',
    address: '4th Floor, Kadooli Tower, West Nadakkavu, Vandipetta Junction, Calicut, Kerala 673011',
    phone: '0495 4915936',
    email: 'edu@fets.in',
    hours: 'Mon - Sun : 8 AM - 6 PM',
    images: ['/images/facility/calicut-reception.jpg', '/images/facility/calicut-testing-stations.jpg', '/images/facility/corridor-lockers.jpg'],
    directions: [
      { mode: 'Train', detail: 'Calicut Railway Station (Approx. 3 KM)' },
      { mode: 'Bus', detail: 'Calicut New Bus Stand (Approx. 4 KM)' },
      { mode: 'Air', detail: 'Calicut International Airport (CCJ) (Approx. 22 KM)' },
    ],
    mapUrl: 'https://maps.google.com/?q=Kadooli+Tower+West+Nadakkavu+Calicut',
  },
  {
    id: 'kochi',
    name: 'Kochi Centre',
    address: '6th Floor, Manjooran Estate, Behind MRA Hotel, Bypass Junction, Edappally, Kochi, Kerala 682024',
    phone: '0484 4541957',
    email: 'edu@fets.in',
    hours: 'Mon - Sun : 8 AM - 6 PM',
    images: ['/images/facility/kochi-reception.jpg', '/images/facility/kochi-testing-hall.jpg', '/images/facility/lockers-closeup.jpg'],
    directions: [
      { mode: 'Train', detail: 'Ernakulam Town (ERN) - 6 KM | Ernakulam Junction (ERS) - 8.7 KM' },
      { mode: 'Metro', detail: 'Edapally Metro Station - 350 Meters' },
      { mode: 'Bus', detail: 'Kaloor Bus Stand - 5 KM | Vytilla Hub - 8.4 KM' },
      { mode: 'Air', detail: 'Cochin International Airport (COK) (Approx. 28 KM)' },
    ],
    mapUrl: 'https://maps.google.com/?q=Manjooran+Estate+Edappally+Kochi',
  },
];
