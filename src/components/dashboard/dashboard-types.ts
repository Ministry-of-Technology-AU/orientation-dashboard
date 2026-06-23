export interface DashboardUserSummary {
  name: string;
  totalPoints: number;
}

export interface TimeSpendingPoint {
  moduleId: string;
  label: string;
  minutes: number;
  active: boolean;
}

export interface ModuleStats {
  total: number;
  completedWithGames: number;
  inProgress: number;
  notStarted: number;
}

export interface ModuleCompletionData {
  percentage: number;
  completed: number;
  total: number;
  nextModule?: {
    title: string;
    href: string;
  };
}

export interface TodayEventSummary {
  title: string;
  location: string;
  time: string;
}

export interface TodayEventsData {
  day: string;
  date: number;
  events: TodayEventSummary[];
}

export type MilestoneStatus = "done" | "in_progress" | "not_started";

export interface JourneyMilestone {
  label: string;
  status: MilestoneStatus;
  subProgress?: { done: number; total: number };
}

export interface JourneyNextUp {
  title: string;
  subtitle: string;
  href: string;
  ctaLabel?: string;
}

export interface DashboardData {
  user: DashboardUserSummary;
  timeSpendingData: TimeSpendingPoint[];
  moduleStats: ModuleStats;
  moduleCompletion: ModuleCompletionData;
  todayEvents: TodayEventsData;
  journeyMilestones: JourneyMilestone[];
  nextUp: JourneyNextUp;
}
