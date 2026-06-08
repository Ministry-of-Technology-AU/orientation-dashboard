export const mockUser = {
  name: "Ananya",
  totalPoints: 64,
};

export const mockTimeSpendingData = [
  { day: "Mon", hours: 1.5, active: false },
  { day: "Tue", hours: 4.0, active: true },
  { day: "Wed", hours: 4.6, active: true },
  { day: "Thu", hours: 2.5, active: false },
  { day: "Fri", hours: 3.1, active: true },
  { day: "Sat", hours: 0.8, active: false },
  { day: "Sun", hours: 2.4, active: false },
];

export const mockModuleStats = {
  total: 9,
  completedWithGames: 4, // 50% — modules + test completed
  completedModules: 2,   // 25% — modules only completed
  notStarted: 3,         // 25% — yet to start
};

export const mockModuleCompletion = {
  percentage: 68,
  completed: 4,
  total: 7,
};

export const mockTodayEvents = {
  day: "Wednesday",
  date: 18,
  events: [
    { title: "Academic Policy Talk", location: "AC04 - 301", time: "11:00 - 1:00 PM" },
    { title: "Internship Seminar", location: "Sports MPH", time: "3:00 - 4:30 PM" },
    { title: "ACWB @ Ashoka", location: "Reddy's Auditorium", time: "4:30 - 6:00 PM" },
  ],
};

export const mockHallOfFame = [
  { name: "Rahul Sharma", points: 240 },
  { name: "Priya Nair", points: 210 },
  { name: "Arjun Mehta", points: 195 },
];

export type MilestoneStatus = "done" | "in_progress" | "not_started";

export interface Milestone {
  label: string;
  status: MilestoneStatus;
  subProgress?: { done: number; total: number };
}

export const mockJourneyMilestones: Milestone[] = [
  { label: "Campus Tour", status: "done" },
  { label: "Shuttle App SetUp", status: "done" },
  { label: "Policy Modules", status: "in_progress", subProgress: { done: 4, total: 7 } },
  { label: "Meet your advisor", status: "not_started" },
  { label: "Club and Socs Fair", status: "not_started" },
];

export const mockNextUp = {
  title: "Academic Policies & Honour Code",
  subtitle: "Continue where you left off:",
  href: "/modules/handbook-academic/read",
};
