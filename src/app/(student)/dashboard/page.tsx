"use client";

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
import { TourStep, TourTrigger } from "@/components/guided-tour";
import { Map } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto px-7 py-6 min-w-0">

        {/* Header */}
        <TourStep
          id="dashboard-header"
          title="Your Points"
          content="Every module you complete, event you attend, and quiz you ace earns you points. Watch this number grow!"
          order={7}
          position="bottom"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Welcome Back, {mockUser.name}!</p>
              <h1 className="text-3xl font-bold text-gray-900">
                You&apos;ve got {mockUser.totalPoints} points!
              </h1>
            </div>

            {/* Tour re-trigger */}
            <TourTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-primary-blue/50 hover:text-primary-blue hover:bg-primary-blue/8 transition-colors cursor-pointer">
              <Map className="w-3.5 h-3.5" />
              Take a tour
            </TourTrigger>
          </div>
        </TourStep>

        {/* Time Spendings */}
        <TourStep
          id="dashboard-time"
          title="Time Spendings"
          content="A breakdown of how you're spending time across different areas — modules, events, chats, and more."
          order={8}
          position="bottom"
          className="mb-6"
        >
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Time Spendings</h2>
            <TimeSpendingsChart data={mockTimeSpendingData} />
          </section>
        </TourStep>

        {/* Bottom grid */}
        <div className="grid grid-cols-[1.15fr_1fr] gap-4">
          <TourStep
            id="dashboard-stats"
            title="Module Progress"
            content="A visual breakdown of all orientation modules — completed, in progress, and still to explore. Aim for the full ring!"
            order={9}
            position="top"
          >
            <StatisticsDonut stats={mockModuleStats} />
          </TourStep>

          <div className="flex flex-col gap-4">
            <TourStep
              id="dashboard-completion"
              title="Module Completion"
              content="Your most recently active modules and how far along you are. Pick up where you left off."
              order={10}
              position="left"
            >
              <ModuleCompletionCard data={mockModuleCompletion} />
            </TourStep>

            <TourStep
              id="dashboard-events"
              title="Today's Events"
              content="Orientation events happening today — talks, walks, socials, and more. Don't miss out."
              order={11}
              position="left"
            >
              <TodayEventsCard data={mockTodayEvents} />
            </TourStep>

            <TourStep
              id="dashboard-fame"
              title="Hall of Fame"
              content="The top students on the leaderboard this week. Complete modules and attend events to climb the ranks."
              order={12}
              position="left"
            >
              <HallOfFameCard entries={mockHallOfFame} />
            </TourStep>
          </div>
        </div>
      </main>

      {/* My Journey right panel */}
      <TourStep
        id="dashboard-journey"
        title="My Journey"
        content="Your personal orientation roadmap — milestones to hit, what's coming up next, and how far you've come."
        order={13}
        position="left"
        className="w-72 shrink-0"
      >
        <aside className="w-full h-full bg-red-tint overflow-y-auto px-6 py-6">
          <MyJourneyPanel milestones={mockJourneyMilestones} nextUp={mockNextUp} />
        </aside>
      </TourStep>
    </>
  );
}
