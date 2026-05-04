import {
  mockUser,
  mockTimeSpendingData,
  mockModuleStats,
  mockModuleCompletion,
  mockTodayEvents,
  mockHallOfFame,
  mockJourneyMilestones,
  mockNextUp,
} from "@/mock-data/dashboard";
import { TimeSpendingsChart } from "@/components/dashboard/time-spendings-chart";
import { StatisticsDonut } from "@/components/dashboard/statistics-donut";
import { ModuleCompletionCard } from "@/components/dashboard/module-completion-card";
import { TodayEventsCard } from "@/components/dashboard/today-events-card";
import { HallOfFameCard } from "@/components/dashboard/hall-of-fame-card";
import { MyJourneyPanel } from "@/components/dashboard/my-journey-panel";

export default function DashboardPage() {
  return (
    <>
      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto px-7 py-6 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Welcome Back, {mockUser.name}!</p>
          <h1 className="text-3xl font-bold text-gray-900">
            You&apos;ve got {mockUser.totalPoints} points!
          </h1>
        </div>

        {/* Time Spendings */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Time Spendings</h2>
          <TimeSpendingsChart data={mockTimeSpendingData} />
        </section>

        {/* Bottom grid: Statistics donut | stacked cards */}
        <div className="grid grid-cols-[1.15fr_1fr] gap-4">
          <StatisticsDonut stats={mockModuleStats} />
          <div className="flex flex-col gap-4">
            <ModuleCompletionCard data={mockModuleCompletion} />
            <TodayEventsCard data={mockTodayEvents} />
            <HallOfFameCard entries={mockHallOfFame} />
          </div>
        </div>
      </main>

      {/* My Journey right panel */}
      <aside className="w-72 shrink-0 bg-[#f9e8e9] overflow-y-auto px-6 py-6">
        <MyJourneyPanel milestones={mockJourneyMilestones} nextUp={mockNextUp} />
      </aside>
    </>
  );
}
