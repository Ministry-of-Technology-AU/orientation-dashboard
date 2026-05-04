export type FaqCategory = "Academics" | "Housing" | "Finance" | "Campus Life";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export const mockFaqItems: FaqItem[] = [
  // Academics
  {
    id: "a1",
    category: "Academics",
    question: "What is the grading system at Ashoka?",
    answer:
      "Ashoka uses a letter-grade system: A (4.0), A- (3.7), B+ (3.3), B (3.0), B- (2.7), C+ (2.3), C (2.0), C- (1.7), D (1.0), and F (0.0). Your GPA is the weighted average of grade points across all courses.",
  },
  {
    id: "a2",
    category: "Academics",
    question: "How do I register for courses?",
    answer:
      "Course registration is done through the Student Portal. Registration windows open by batch — check the academic calendar for your specific date. You can add or drop courses freely during the add-drop period (first 7 days of the semester).",
  },
  {
    id: "a3",
    category: "Academics",
    question: "What is the minimum attendance requirement?",
    answer:
      "Students must maintain at least 75% attendance in each course. Falling below this threshold may result in a grade penalty or deregistration from the course. Medical absences with documentation are considered separately.",
  },
  {
    id: "a4",
    category: "Academics",
    question: "How many credits do I need to graduate?",
    answer:
      "You need 128 credits to complete an undergraduate degree at Ashoka. This includes Foundation courses, major requirements, electives, and co-curricular credits. Your academic advisor can provide a personalised credit breakdown.",
  },
  {
    id: "a5",
    category: "Academics",
    question: "Can I change my major after the first year?",
    answer:
      "Yes, you can change or declare a major after completing your Foundation year. You must meet with your academic advisor and submit a Change of Major form through the registrar's office before the deadline specified in the academic calendar.",
  },

  // Housing
  {
    id: "h1",
    category: "Housing",
    question: "When can I move into the residence halls?",
    answer:
      "New students can move in from the date specified in your acceptance email — typically 2 days before orientation week begins. Bring your student ID and accommodation confirmation letter to collect your room keys from the Housing Office.",
  },
  {
    id: "h2",
    category: "Housing",
    question: "What is included in my room?",
    answer:
      "Each room comes with a bed, mattress, desk, chair, wardrobe, and bookshelf. WiFi is provided throughout the campus. You will need to bring your own bedding, toiletries, and personal items. Common laundry rooms are located on each floor.",
  },
  {
    id: "h3",
    category: "Housing",
    question: "Can I request a specific roommate?",
    answer:
      "Yes, mutual roommate requests can be submitted through the Housing Portal before the deadline (usually 4 weeks before move-in). Both students must submit matching requests. Requests are honoured subject to room availability.",
  },
  {
    id: "h4",
    category: "Housing",
    question: "What is the guest policy in the residence halls?",
    answer:
      "Day guests are welcome between 8 AM and 10 PM. Overnight guests require prior approval from the Resident Assistant and the Housing Office. Guests must register at the security desk and be accompanied by the host student at all times.",
  },

  // Finance
  {
    id: "f1",
    category: "Finance",
    question: "How do I pay my tuition and accommodation fees?",
    answer:
      "Fees can be paid online via the Student Finance Portal using net banking, NEFT/RTGS, or UPI. The portal is accessible through your student account. Payment is due in two installments — before the start of each semester. Refer to the fee schedule for exact dates.",
  },
  {
    id: "f2",
    category: "Finance",
    question: "What financial aid options are available?",
    answer:
      "Ashoka offers need-based scholarships, merit scholarships, and sibling discounts. Financial aid applications are reviewed annually. Contact the Financial Aid Office at finaid@ashoka.edu.in for your eligibility status or to submit supporting documents.",
  },
  {
    id: "f3",
    category: "Finance",
    question: "Is there a campus meal plan?",
    answer:
      "Yes, a meal plan is bundled with on-campus accommodation. It covers breakfast, lunch, and dinner at the main dining hall. Additional meal credits can be purchased at the Housing Office. Students living off-campus can purchase a standalone meal plan.",
  },

  // Campus Life
  {
    id: "c1",
    category: "Campus Life",
    question: "How do I join a club or society?",
    answer:
      "Clubs and societies hold recruitment drives during the Club and Socs Fair in the first two weeks of semester. You can also discover clubs through the Orientation Hub's Explore page and express interest directly. Most clubs have open membership with no formal try-out.",
  },
  {
    id: "c2",
    category: "Campus Life",
    question: "What healthcare services are on campus?",
    answer:
      "The campus health centre is open Monday–Saturday, 9 AM–6 PM. It provides general consultations, basic medications, and first-aid. For emergencies, call the campus emergency line. Health insurance is mandatory and included in your fee structure.",
  },
  {
    id: "c3",
    category: "Campus Life",
    question: "Is there a shuttle service between campus and the city?",
    answer:
      "Yes, Ashoka runs a scheduled shuttle between campus and key points in Delhi/NCR. The schedule and booking system are available on the Shuttle App — set it up via the Orientation Hub. Seats must be reserved in advance.",
  },
  {
    id: "c4",
    category: "Campus Life",
    question: "Where can I print and scan documents on campus?",
    answer:
      "Print and scan stations are available in the Library (AC01), the Student Centre, and each academic building's ground floor. You receive a monthly printing quota — top-ups can be purchased at the IT Help Desk.",
  },
];

export const FAQ_CATEGORIES: FaqCategory[] = ["Academics", "Housing", "Finance", "Campus Life"];
