export type GameType = "quiz" | "wordle" | "connections";
export type Difficulty = "easy" | "moderate" | "hard";
export type ModuleStatus = "completed" | "in_progress" | "not_started";

export interface QuizConfig {
  questions: { q: string; options: string[]; answer: string }[];
}
export interface WordleConfig {
  word: string;
  maxAttempts: number;
  hint: string;
}
export interface ConnectionsConfig {
  groups: { label: string; color: "yellow" | "green" | "blue" | "purple"; items: string[] }[];
}

export interface MockGame {
  id: string;
  title: string;
  type: GameType;
  difficulty: Difficulty;
  pointsValue: number;
  estimatedMins: number;
  config: QuizConfig | WordleConfig | ConnectionsConfig;
}

export interface MockModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  isMandatory: boolean;
  orderIndex: number;
  journeyMilestone: string | null;
  status: ModuleStatus;
  readPercent: number;
  /** Whether the student has read the module (drives game unlocking). Populated server-side from the DB. */
  isRead?: boolean;
  /** Per-game-type completion, populated server-side from the DB. */
  gamesDone?: Partial<Record<GameType, boolean>>;
  /** Per-game-type best score/points, populated server-side from the DB. */
  gameScores?: Partial<Record<GameType, { score: number; points: number; maxScore: number }>>;
  games: MockGame[];
}

export const mockModules: MockModule[] = [
  {
    id: "1",
    slug: "handbook-academic",
    title: "Academic Information",
    description:
      "Everything you need to know about Ashoka's credit system, Foundation Courses, Majors, Minors, grading, add/drop deadlines, the Dean's List, Latin Honours, and the Office of Academic Affairs.",
    iconName: "book-open",
    isMandatory: true,
    orderIndex: 1,
    journeyMilestone: "Academics",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g1",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 10,
        config: {
          questions: [
            {
              q: "How many Foundation Courses must every Ashoka UG student complete?",
              options: ["7", "8", "9", "10"],
              answer: "9",
            },
            {
              q: "What is the minimum CGPA required to graduate from Ashoka University?",
              options: ["1.33", "1.50", "1.67", "2.00"],
              answer: "1.67",
            },
            {
              q: "By the end of which semester must students formally declare their Major?",
              options: ["Second semester", "Third semester", "Fourth semester", "Fifth semester"],
              answer: "Third semester",
            },
            {
              q: "What semester GPA qualifies a student for the Dean's List?",
              options: ["3.50 or above", "3.60 or above", "3.65 or above", "3.75 or above"],
              answer: "3.65 or above",
            },
            {
              q: "What CGPA is required for Summa Cum Laude at graduation?",
              options: ["3.60", "3.75", "3.85", "3.90"],
              answer: "3.90",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g2",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "moderate",
        pointsValue: 40,
        estimatedMins: 5,
        config: {
          word: "MAJOR",
          maxAttempts: 6,
          hint: "The subject in which you earn your Bachelor's degree at Ashoka",
        } satisfies WordleConfig,
      },
      {
        id: "g3",
        title: "Play Connections",
        type: "connections",
        difficulty: "hard",
        pointsValue: 60,
        estimatedMins: 10,
        config: {
          groups: [
            { label: "9 Foundation Courses", color: "yellow", items: ["Great Books", "Mind and Behaviour", "Environmental Studies", "Indian Civilizations"] },
            { label: "Latin Honours", color: "green", items: ["Cum Laude", "Magna Cum Laude", "Summa Cum Laude", "Dean's List"] },
            { label: "Add/Drop Milestones", color: "blue", items: ["Week 1 free add", "Week 2–4 with faculty", "Week 5–8 withdrawal", "Week 9+ WF notation"] },
            { label: "OAA Functions", color: "purple", items: ["Course registration", "Mentor assignment", "Grade functions", "Degree check"] },
          ],
        } satisfies ConnectionsConfig,
      },
    ],
  },
  {
    id: "2",
    slug: "handbook-campus-services",
    title: "Campus Facilities & Services",
    description:
      "Your guide to dining hall timings, campus eateries, the shuttle service and MoveInSync seat booking, the 16-bed infirmary, security helplines, housekeeping, laundry, mailroom, and maintenance schedules.",
    iconName: "building-2",
    isMandatory: true,
    orderIndex: 2,
    journeyMilestone: "Campus Life",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g4",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 10,
        config: {
          questions: [
            {
              q: "What are the breakfast timings at the Ashoka Dining Hall?",
              options: ["7:00 AM – 9:30 AM", "7:30 AM – 10:00 AM", "8:00 AM – 10:30 AM", "8:30 AM – 11:00 AM"],
              answer: "8:00 AM – 10:30 AM",
            },
            {
              q: "Which app do you use to book a seat in the campus shuttle?",
              options: ["CollPoll", "MoveInSync", "MyAshoka", "AMS"],
              answer: "MoveInSync",
            },
            {
              q: "On weekdays, between what hours is air-conditioning available in the Residence Halls?",
              options: ["5:00 pm – 5:00 am", "6:00 pm – 6:00 am", "7:00 pm – 7:00 am", "8:00 pm – 8:00 am"],
              answer: "6:00 pm – 6:00 am",
            },
            {
              q: "What is the 24x7 Infirmary emergency helpline number?",
              options: ["8199977071", "8199977073", "8199977074", "8199977075"],
              answer: "8199977073",
            },
            {
              q: "If you have three 'No Shows' on the shuttle app within 30 days, how long will you be blocked?",
              options: ["7 days", "10 days", "15 days", "30 days"],
              answer: "15 days",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g5",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "easy",
        pointsValue: 30,
        estimatedMins: 5,
        config: {
          word: "MEALS",
          maxAttempts: 6,
          hint: "Breakfast, lunch, snacks, dinner — the dining hall serves four of these every day",
        } satisfies WordleConfig,
      },
      {
        id: "g6",
        title: "Play Connections",
        type: "connections",
        difficulty: "moderate",
        pointsValue: 50,
        estimatedMins: 8,
        config: {
          groups: [
            { label: "Campus Eateries (Food Gully)", color: "yellow", items: ["Rasananda", "Shuddh Desi Dhaba", "Dosai", "Domino's"] },
            { label: "Helpline Numbers", color: "green", items: ["8199977073 (Infirmary)", "8199977071 (Security)", "8222930514 (Transport)", "7496967703 (Housekeeping)"] },
            { label: "Dining Hall Timings", color: "blue", items: ["Breakfast 8:00–10:30", "Lunch 12:15–2:30", "Snacks 4:45–6:15", "Dinner 7:30–10:15"] },
            { label: "Visiting Specialists", color: "purple", items: ["Physiotherapist", "Gynaecologist", "Resident Doctor", "Blue Circle Medi"] },
          ],
        } satisfies ConnectionsConfig,
      },
    ],
  },
  {
    id: "3",
    slug: "handbook-library",
    title: "Library Services — HDFC Library",
    description:
      "Explore the HDFC Library's 90,900+ print books, 16,500+ e-journals, 4 lakh+ e-books, the mLibrary app, the Digital Research Support Service (DRSS), and research integrity tools like Zotero and Mendeley.",
    iconName: "library",
    isMandatory: true,
    orderIndex: 3,
    journeyMilestone: "Campus Life",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g7",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 8,
        config: {
          questions: [
            {
              q: "How many print books can an Ashoka UG student borrow at one time?",
              options: ["1", "2", "3", "5"],
              answer: "3",
            },
            {
              q: "What is the late-return fine at the HDFC Library?",
              options: ["Rs. 5 per day per book", "Rs. 10 per day per book", "Rs. 20 per day per book", "Rs. 50 per day"],
              answer: "Rs. 10 per day per book",
            },
            {
              q: "How many e-journals does the HDFC Library provide access to?",
              options: ["~8,000", "~12,000", "~16,547", "~25,000"],
              answer: "~16,547",
            },
            {
              q: "When is the HDFC Library open 24x7 (except Friday nights)?",
              options: ["Only during exams", "When academic sessions are in progress", "Year-round always", "Only in the monsoon semester"],
              answer: "When academic sessions are in progress",
            },
            {
              q: "What are the three components of the library's Digital Research Support Service (DRSS)?",
              options: [
                "Catalogue, e-Library, ILL",
                "Knowledge Guide, Research Profile, Research Forum",
                "Zotero, Mendeley, OPAC",
                "mLibrary, DELNET, OPAC",
              ],
              answer: "Knowledge Guide, Research Profile, Research Forum",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g8",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "easy",
        pointsValue: 30,
        estimatedMins: 5,
        config: {
          word: "BOOKS",
          maxAttempts: 6,
          hint: "The HDFC Library has over 90,900 of these in print",
        } satisfies WordleConfig,
      },
    ],
  },
  {
    id: "4",
    slug: "it-handbook",
    title: "IT Services & Handbook",
    description:
      "Set up your Ashoka email, configure Wi-Fi on your laptop, understand the AMS and MyAshoka portals, learn the IT escalation matrix, and know the policies for smart cards, printing, and network access.",
    iconName: "monitor",
    isMandatory: true,
    orderIndex: 4,
    journeyMilestone: "Campus Life",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g-it-quiz",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 8,
        config: {
          questions: [
            {
              q: "What is the format of an Ashoka student email ID?",
              options: [
                "FirstName_LastName@ashoka.edu.in",
                "FirstName.LastName_<ProgramCode><yy>@ashoka.edu.in",
                "StudentID@ashoka.edu.in",
                "LastName.FirstName@ashoka.edu.in",
              ],
              answer: "FirstName.LastName_<ProgramCode><yy>@ashoka.edu.in",
            },
            {
              q: "What is the maximum number of devices a student can register on the Ashoka Wi-Fi network?",
              options: ["1", "2", "3", "4"],
              answer: "2",
            },
            {
              q: "Where should you first log an IT service request?",
              options: ["Email to IT helpdesk", "Walk-in to Academic Block 02", "CollPoll website/app", "MyAshoka portal"],
              answer: "CollPoll website/app",
            },
            {
              q: "Three uses of the smart card student ID are dining kiosks, hostel attendance, and ___",
              options: ["Library borrowing", "Gate entry/exit", "Shuttle booking", "Gym access"],
              answer: "Gate entry/exit",
            },
            {
              q: "What happens to a student's Ashoka email ID one month after graduation?",
              options: [
                "It stays active permanently",
                "It is converted to an alumni email ID",
                "It is archived with read-only access",
                "It is forwarded to personal email",
              ],
              answer: "It is converted to an alumni email ID",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g-it-wordle",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "easy",
        pointsValue: 30,
        estimatedMins: 5,
        config: {
          word: "EMAIL",
          maxAttempts: 6,
          hint: "Your primary communication channel at Ashoka — format: FirstName.LastName_UG26@ashoka.edu.in",
        } satisfies WordleConfig,
      },
      {
        id: "g-it-connections",
        title: "Play Connections",
        type: "connections",
        difficulty: "moderate",
        pointsValue: 50,
        estimatedMins: 8,
        config: {
          groups: [
            { label: "Key Portals", color: "yellow", items: ["MyAshoka", "AMS", "CollPoll", "elibrary.ashoka.edu.in"] },
            { label: "Smart Card Uses", color: "green", items: ["Dining kiosks", "Gate entry/exit", "Hostel attendance", "Student ID"] },
            { label: "IT Infrastructure Issues", color: "blue", items: ["Wi-Fi problems", "Hardware faults", "Computer lab issues", "Classroom AV"] },
            { label: "IT Systems Issues", color: "purple", items: ["Web applications", "MyAshoka portal", "LMS access", "Mobile apps"] },
          ],
        } satisfies ConnectionsConfig,
      },
    ],
  },
  // ── Residence Life Modules ──────────────────────────────────────────────────
  {
    id: "6",
    slug: "reslife-module1",
    title: "Residence Life — Your Room & Your Rights",
    description:
      "Understand how rooms and roommates are assigned, what your rights as a resident are, how to resolve conflicts, and what the keys and ID card policies mean for your daily campus life.",
    iconName: "home",
    isMandatory: true,
    orderIndex: 5,
    journeyMilestone: "Residence Life",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g9",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 8,
        config: {
          questions: [
            {
              q: "How long does a student have to accept a room reassignment offer from the Residence Life Office?",
              options: ["12 hours", "24 hours", "48 hours", "72 hours"],
              answer: "24 hours",
            },
            {
              q: "Once a room change offer is accepted, within how many hours must the student move into the new room?",
              options: ["24 hours", "36 hours", "48 hours", "72 hours"],
              answer: "48 hours",
            },
            {
              q: "What is the first step a student should take when experiencing roommate conflict?",
              options: [
                "Go directly to the Residence Life Office",
                "Request a room change immediately",
                "Communicate directly and responsibly with the roommate",
                "Contact the Dean of Student Affairs",
              ],
              answer: "Communicate directly and responsibly with the roommate",
            },
            {
              q: "How many times per academic year will the University replace a lost student ID card?",
              options: ["Once", "Twice", "Three times", "Unlimited times"],
              answer: "Twice",
            },
            {
              q: "At the end of the academic year, within how many hours of a roommate reassignment notification must a student move?",
              options: ["24 hours", "48 hours", "72 hours", "96 hours"],
              answer: "72 hours",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g10",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "easy",
        pointsValue: 30,
        estimatedMins: 5,
        config: {
          word: "WARDEN",
          maxAttempts: 6,
          hint: "The Residence Hall staff member you should approach first for room-related concerns",
        } satisfies WordleConfig,
      },
      {
        id: "g11",
        title: "Play Connections",
        type: "connections",
        difficulty: "moderate",
        pointsValue: 50,
        estimatedMins: 8,
        config: {
          groups: [
            { label: "Resident Rights", color: "yellow", items: ["Privacy", "Study peacefully", "Clean environment", "Equal treatment"] },
            { label: "Room Change Steps", color: "green", items: ["Talk to roommate", "Meet your RA", "Refer to ResLife", "Accept/decline offer"] },
            { label: "ResLife Key Contacts", color: "blue", items: ["Warden", "RA", "Director", "OLS"] },
            { label: "ID Card Rules", color: "purple", items: ["Carry at all times", "Report if lost", "Return on graduation", "HID enabled"] },
          ],
        } satisfies ConnectionsConfig,
      },
    ],
  },
  {
    id: "7",
    slug: "reslife-module2",
    title: "Residence Life — Rules, Conduct & Movement",
    description:
      "Everything you need to know about quiet hours, gate timings, leave procedures, hosting guests, and how campus movement works for resident students, off-campus students, and visitors.",
    iconName: "map-pin",
    isMandatory: true,
    orderIndex: 6,
    journeyMilestone: "Residence Life",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g12",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 8,
        config: {
          questions: [
            {
              q: "What are Quiet Hours at Ashoka University?",
              options: ["11:00 pm – 6:00 am", "12:00 am – 6:00 am", "1:00 am – 7:00 am", "10:00 pm – 7:00 am"],
              answer: "1:00 am – 7:00 am",
            },
            {
              q: "Between what hours are resident students permitted to enter or exit campus?",
              options: ["5:00 am – 11:00 pm", "6:00 am – 12:00 midnight", "7:00 am – 10:00 pm", "8:00 am – 12:00 midnight"],
              answer: "6:00 am – 12:00 midnight",
            },
            {
              q: "Students on the Case-by-Case leave system must return to campus by what time?",
              options: ["9:00 pm", "10:00 pm", "11:00 pm", "12:00 midnight"],
              answer: "10:00 pm",
            },
            {
              q: "By what time must a student obtain prior permission for an after-midnight campus entry or exit?",
              options: ["6:00 pm the previous day", "9:00 pm the previous day", "12:00 noon the same day", "Morning of the same day"],
              answer: "9:00 pm the previous day",
            },
            {
              q: "Off-campus visitors are allowed to visit students on campus between which hours?",
              options: ["7:00 am – 9:00 pm", "8:00 am – 8:00 pm", "9:00 am – 10:00 pm", "10:00 am – 6:00 pm"],
              answer: "8:00 am – 8:00 pm",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g13",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "moderate",
        pointsValue: 30,
        estimatedMins: 5,
        config: {
          word: "QUIET",
          maxAttempts: 6,
          hint: "Between 1 AM and 7 AM every day, the campus observes these hours",
        } satisfies WordleConfig,
      },
    ],
  },
  {
    id: "8",
    slug: "reslife-module3",
    title: "Residence Life — Health, Safety & Accountability",
    description:
      "Learn about physical and mental health protocols, the zero-tolerance policy on substances, fire safety rules, room inspection procedures, and the general guidelines that govern life on campus.",
    iconName: "shield-check",
    isMandatory: true,
    orderIndex: 7,
    journeyMilestone: "Residence Life",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g14",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "moderate",
        pointsValue: 20,
        estimatedMins: 10,
        config: {
          questions: [
            {
              q: "Which of the following personal appliances is prohibited inside Residence Hall rooms?",
              options: ["Laptop", "Phone charger", "Induction/hot plate", "Desk lamp"],
              answer: "Induction/hot plate",
            },
            {
              q: "How many people must be present for a quorum during a room inspection?",
              options: ["2", "3", "4", "5"],
              answer: "3",
            },
            {
              q: "Within how many working days must a student appeal a room inspection they believe was conducted improperly?",
              options: ["3 days", "5 days", "7 days", "10 days"],
              answer: "5 days",
            },
            {
              q: "The Residence Life Helpline number is:",
              options: ["+91 7082000403", "+91 7082000421", "+91 7082000572", "+91 8199977073"],
              answer: "+91 7082000572",
            },
            {
              q: "What is Ashoka's policy on alcohol, tobacco, and controlled substances on campus?",
              options: [
                "Permitted in private rooms only",
                "Permitted on weekends",
                "Zero-tolerance — strictly prohibited on all university premises",
                "Allowed for students above 21",
              ],
              answer: "Zero-tolerance — strictly prohibited on all university premises",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g15",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "hard",
        pointsValue: 40,
        estimatedMins: 5,
        config: {
          word: "RAGGING",
          maxAttempts: 6,
          hint: "Any act that causes annoyance, hardship, or harm to another student — strictly prohibited and may lead to dismissal",
        } satisfies WordleConfig,
      },
      {
        id: "g16",
        title: "Play Connections",
        type: "connections",
        difficulty: "hard",
        pointsValue: 60,
        estimatedMins: 10,
        config: {
          groups: [
            { label: "Mental Health Helplines", color: "yellow", items: ["1800-258-8121", "1800-258-8999", "1800-202-6121", "7082000421"] },
            { label: "Prohibited in Rooms", color: "green", items: ["Kettle", "Microwave", "Induction plate", "Mini-fridge"] },
            { label: "Inspection Team Members", color: "blue", items: ["Warden", "Deputy Director", "Director", "Student observer"] },
            { label: "Report These To", color: "purple", items: ["ARC for ragging", "ICC/CASH for harassment", "ResLife for room issues", "Student Care for wellbeing"] },
          ],
        } satisfies ConnectionsConfig,
      },
    ],
  },
];

export function getModuleBySlug(slug: string): MockModule | undefined {
  return mockModules.find((m) => m.slug === slug);
}

export function getGameById(gameId: string): { game: MockGame; module: MockModule } | undefined {
  for (const moduleDef of mockModules) {
    const game = moduleDef.games.find((g) => g.id === gameId);
    if (game) return { game, module: moduleDef };
  }
  return undefined;
}
