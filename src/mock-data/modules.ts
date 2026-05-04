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
  games: MockGame[];
}

export const mockModules: MockModule[] = [
  {
    id: "1",
    slug: "undergraduate-handbook",
    title: "Undergraduate Handbook for UG 2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque vulputate turpis quis pellentesque. Donec egestas malesuada diam et semper. Vestibulum justo nunc, tempor at fringilla ac, imperdiet sit amet justo. Quisque condimentum consequat rhoncus. Donec sollicitudin nec metus ut placerat.",
    iconName: "book-open",
    isMandatory: true,
    orderIndex: 1,
    journeyMilestone: "Policy Modules",
    status: "in_progress",
    readPercent: 45,
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
              q: "What is the minimum attendance requirement per course at Ashoka?",
              options: ["60%", "70%", "75%", "80%"],
              answer: "75%",
            },
            {
              q: "How many credits are required to complete an undergraduate degree?",
              options: ["100", "120", "128", "140"],
              answer: "128",
            },
            {
              q: "Which body is responsible for handling academic integrity violations?",
              options: ["Dean's Office", "CADI", "SGA", "Faculty Council"],
              answer: "CADI",
            },
            {
              q: "What is the maximum number of courses a student can take per semester?",
              options: ["4", "5", "6", "7"],
              answer: "5",
            },
            {
              q: "When does the add-drop period typically end?",
              options: ["Day 3", "Day 7", "Day 10", "Day 14"],
              answer: "Day 7",
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
          word: "HONOR",
          maxAttempts: 6,
          hint: "A core value upheld in academic life",
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
            { label: "Academic Policies", color: "yellow", items: ["CADI", "CASH", "AIP", "IDP"] },
            { label: "Student Bodies", color: "green", items: ["SGA", "SMC", "OAA", "SAC"] },
            { label: "Campus Buildings", color: "blue", items: ["AC01", "AC02", "AC03", "AC04"] },
            { label: "Key Processes", color: "purple", items: ["Add-Drop", "Withdrawal", "Registration", "Transcript"] },
          ],
        } satisfies ConnectionsConfig,
      },
    ],
  },
  {
    id: "2",
    slug: "academic-integrity-policy",
    title: "Academic Integrity Policy",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque vulputate turpis quis pellentesque. Donec egestas malesuada diam et semper.",
    iconName: "shield",
    isMandatory: true,
    orderIndex: 2,
    journeyMilestone: "Policy Modules",
    status: "completed",
    readPercent: 100,
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
              q: "What constitutes academic plagiarism?",
              options: [
                "Using your own previous work",
                "Presenting others' work as your own without attribution",
                "Citing too many sources",
                "Writing more than required",
              ],
              answer: "Presenting others' work as your own without attribution",
            },
            {
              q: "What is the first step when an integrity violation is suspected?",
              options: ["Expulsion", "Informal meeting with faculty", "Immediate suspension", "Public announcement"],
              answer: "Informal meeting with faculty",
            },
            {
              q: "Which of these is NOT considered an integrity violation?",
              options: ["Collusion", "Fabrication", "Group study for exams", "Ghost-writing"],
              answer: "Group study for exams",
            },
          ],
        } satisfies QuizConfig,
      },
      {
        id: "g5",
        title: "Play Wordle",
        type: "wordle",
        difficulty: "moderate",
        pointsValue: 40,
        estimatedMins: 5,
        config: {
          word: "ETHIC",
          maxAttempts: 6,
          hint: "The moral principles guiding academic conduct",
        } satisfies WordleConfig,
      },
    ],
  },
  {
    id: "3",
    slug: "internship-policy",
    title: "Internship Policy",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque vulputate turpis quis pellentesque. Donec egestas malesuada diam et semper.",
    iconName: "briefcase",
    isMandatory: true,
    orderIndex: 3,
    journeyMilestone: "Policy Modules",
    status: "in_progress",
    readPercent: 30,
    games: [
      {
        id: "g6",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 10,
        config: {
          questions: [
            {
              q: "How many credits can be earned through an internship?",
              options: ["1", "2", "3", "4"],
              answer: "3",
            },
            {
              q: "What is the minimum duration for a credit-bearing internship?",
              options: ["2 weeks", "4 weeks", "6 weeks", "8 weeks"],
              answer: "6 weeks",
            },
          ],
        } satisfies QuizConfig,
      },
    ],
  },
  {
    id: "4",
    slug: "cash-policy",
    title: "CASH Policy",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque vulputate turpis quis pellentesque. Donec egestas malesuada diam et semper.",
    iconName: "heart-handshake",
    isMandatory: true,
    orderIndex: 4,
    journeyMilestone: "Policy Modules",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g7",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 10,
        config: {
          questions: [
            {
              q: "What does CASH stand for?",
              options: [
                "Campus And Student Health",
                "Committee Against Sexual Harassment",
                "Centre for Academic Support Hub",
                "Campus Activities Student Hub",
              ],
              answer: "Committee Against Sexual Harassment",
            },
          ],
        } satisfies QuizConfig,
      },
    ],
  },
  {
    id: "5",
    slug: "cadi-policy",
    title: "CADI Policy",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque vulputate turpis quis pellentesque. Donec egestas malesuada diam et semper.",
    iconName: "file-text",
    isMandatory: true,
    orderIndex: 5,
    journeyMilestone: "Policy Modules",
    status: "not_started",
    readPercent: 0,
    games: [
      {
        id: "g8",
        title: "Quiz Yourself!",
        type: "quiz",
        difficulty: "easy",
        pointsValue: 20,
        estimatedMins: 10,
        config: {
          questions: [
            {
              q: "CADI stands for Committee Against Discrimination and ___",
              options: ["Intimidation", "Inequality", "Indifference", "Intrusion"],
              answer: "Intimidation",
            },
          ],
        } satisfies QuizConfig,
      },
    ],
  },
];

export function getModuleBySlug(slug: string): MockModule | undefined {
  return mockModules.find((m) => m.slug === slug);
}

export function getGameById(gameId: string): { game: MockGame; module: MockModule } | undefined {
  for (const module of mockModules) {
    const game = module.games.find((g) => g.id === gameId);
    if (game) return { game, module };
  }
  return undefined;
}
