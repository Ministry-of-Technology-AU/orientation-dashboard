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
import { useWebHaptics } from "web-haptics/react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
} as const;

export default function DashboardPage() {
  const haptic = useWebHaptics();

  // Robust null handling / fallback values for all dashboard data
  const user = mockUser ?? { name: "Ashokan Student", totalPoints: 0 };
  const timeSpendingData = mockTimeSpendingData ?? [];
  const moduleStats = mockModuleStats ?? { total: 0, completedWithGames: 0, completedModules: 0, notStarted: 0 };
  const moduleCompletion = mockModuleCompletion ?? { percentage: 0, completed: 0, total: 0 };
  const todayEvents = mockTodayEvents ?? { day: "", date: 0, events: [] };
  const hallOfFame = mockHallOfFame ?? [];
  const journeyMilestones = mockJourneyMilestones ?? [];
  const nextUp = mockNextUp ?? { title: "", subtitle: "", href: "" };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-full w-full overflow-y-auto lg:overflow-hidden min-w-0 p-3 md:pl-0 gap-3">
      {/* Main scrollable content card */}
      <motion.main
        key="dashboard-main"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 w-full lg:h-full lg:overflow-y-auto px-5 py-6 sm:px-7 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(10,56,100,0.04)] min-w-0 flex flex-col gap-6 order-last lg:order-none"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <TourStep
            id="dashboard-header"
            title="Your Points"
            content="Every module you complete, event you attend, and quiz you ace earns you points. Watch this number grow!"
            order={7}
            position="bottom"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide">Welcome Back, {user.name}!</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-blue mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                  You&apos;ve got {user.totalPoints} points!
                </h1>
              </div>

              {/* Tour re-trigger */}
              <TourTrigger className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-blue/60 hover:text-primary-blue hover:bg-primary-blue/8 border border-primary-blue/10 transition-all active:scale-95 cursor-pointer shrink-0">
                <div
                  onClick={() => haptic.trigger("medium")}
                  className="flex items-center gap-1.5 w-full h-full"
                >
                  <Map className="w-3.5 h-3.5" />
                  Take a tour
                </div>
              </TourTrigger>
            </div>
          </TourStep>
        </motion.div>

        {/* Time Spendings */}
        <motion.div variants={itemVariants} className="w-full">
          <TourStep
            id="dashboard-time"
            title="Time Spendings"
            content="A breakdown of how you're spending time across different areas — modules, events, chats, and more."
            order={8}
            position="bottom"
            className="w-full"
          >
            <section className="bg-neutral-50/50 backdrop-blur-sm border border-gray-100 rounded-xl p-4 sm:p-5">
              <h2 className="text-xs font-bold text-primary-blue/70 uppercase tracking-wider mb-4 font-sans">Time Spendings</h2>
              <TimeSpendingsChart data={timeSpendingData} />
            </section>
          </TourStep>
        </motion.div>

        {/* Bottom grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
          <TourStep
            id="dashboard-stats"
            title="Module Progress"
            content="A visual breakdown of all orientation modules — completed, in progress, and still to explore. Aim for the full ring!"
            order={9}
            position="top"
          >
            <StatisticsDonut stats={moduleStats} />
          </TourStep>

          <div className="flex flex-col gap-6">
            <TourStep
              id="dashboard-completion"
              title="Module Completion"
              content="Your most recently active modules and how far along you are. Pick up where you left off."
              order={10}
              position="left"
            >
              <ModuleCompletionCard data={moduleCompletion} />
            </TourStep>

            <TourStep
              id="dashboard-events"
              title="Today's Events"
              content="Orientation events happening today — talks, walks, socials, and more. Don't miss out."
              order={11}
              position="left"
            >
              <TodayEventsCard data={todayEvents} />
            </TourStep>

            <TourStep
              id="dashboard-fame"
              title="Hall of Fame"
              content="The top students on the leaderboard this week. Complete modules and attend events to climb the ranks."
              order={12}
              position="left"
            >
              <HallOfFameCard entries={hallOfFame} />
            </TourStep>
          </div>
        </motion.div>
      </motion.main>

      {/* My Journey right panel card */}
      <TourStep
        id="dashboard-journey"
        title="My Journey"
        content="Your personal orientation roadmap — milestones to hit, what's coming up next, and how far you've come."
        order={13}
        position="left"
        className="w-full lg:w-80 shrink-0 order-first lg:order-none"
      >
        <aside className="w-full lg:h-full lg:overflow-y-auto px-5 py-6 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(10,56,100,0.04)]">
          <MyJourneyPanel milestones={journeyMilestones} nextUp={nextUp} />
        </aside>
      </TourStep>
    </div>
  );
}
