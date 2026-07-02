import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar";
import { getGuidesMeta } from "@/lib/notion";
import { formatTime } from "@/mock-data/calendar";
import { type GameType, type MockModule, type Difficulty, type MockGame, type ModuleStatus } from "@/mock-data/modules";
import { getEntry, parseModulesStatus, type ModuleStatusEntry } from "@/lib/module-progress";
import { parseDashboardProgress, type DashboardProgress } from "@/lib/dashboard-progress";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import type {
  DashboardData,
  JourneyMilestone,
  JourneyNextUp,
  ModuleStats,
  TimeSpendingPoint,
  TodayEventsData,
} from "@/components/dashboard/dashboard-types";

type ScoreEntry = { score?: number; points?: number; maxScore?: number };
type ModuleScores = Record<string, Partial<Record<GameType, ScoreEntry>>>;
type DashboardUserRecord = {
  name: string;
  modulesStatus: unknown;
  moduleScores: unknown;
  dashboardProgress: unknown;
  isOnboarded: boolean;
  isTourComplete: boolean;
};
type DashboardUserDelegate = {
  findUnique(args: {
    where: { email: string };
    select: {
      name: true;
      modulesStatus: true;
      moduleScores: true;
      dashboardProgress: true;
      isOnboarded: true;
      isTourComplete: true;
    };
  }): Promise<DashboardUserRecord | null>;
};

function parseModuleScores(raw: unknown): ModuleScores {
  if (!raw || typeof raw !== "object") return {};
  return raw as ModuleScores;
}

function totalPoints(scores: ModuleScores): number {
  return Object.values(scores).reduce((sum, moduleScore) => {
    return sum + Object.values(moduleScore).reduce((moduleSum, entry) => {
      const points = typeof entry?.points === "number" && Number.isFinite(entry.points) ? entry.points : 0;
      return moduleSum + points;
    }, 0);
  }, 0);
}

function quizMeetsThreshold(scores: ModuleScores, moduleId: string): boolean {
  const quiz = scores[moduleId]?.quiz;
  const score = typeof quiz?.score === "number" ? quiz.score : 0;
  const maxScore = typeof quiz?.maxScore === "number" ? quiz.maxScore : 0;
  return maxScore > 0 && score / maxScore >= 0.8;
}

function gameIsComplete(type: GameType, entry: ModuleStatusEntry, scores: ModuleScores, moduleId: string): boolean {
  if (type === "quiz") return quizMeetsThreshold(scores, moduleId);
  if (type === "wordle") return !!entry.isWordleDone;
  return !!entry.isConnectionsDone;
}

function moduleIsComplete(module: MockModule, entry: ModuleStatusEntry, scores: ModuleScores): boolean {
  if (!entry.isRead) return false;
  if (module.games.length === 0) return true;
  return module.games.every((game) => gameIsComplete(game.type, entry, scores, module.id));
}

function moduleHasProgress(entry: ModuleStatusEntry): boolean {
  return !!entry.started || !!entry.isRead || (entry.readPercent ?? 0) > 0 || (entry.readSeconds ?? 0) > 0;
}

function buildTimeSpendingData(
  status: Record<string, ModuleStatusEntry>,
  modules: MockModule[]
): TimeSpendingPoint[] {
  return modules
    .map((module) => {
      const readSeconds = Math.max(0, Math.floor(getEntry(status, module.id).readSeconds ?? 0));
      return {
        moduleId: module.id,
        label: module.title
          .replace(/^handbook\s*/i, "")
          .split(/\s+/)
          .slice(0, 2)
          .join(" "),
        minutes: Math.max(1, Math.round(readSeconds / 60)),
        active: false,
        readSeconds,
      };
    })
    .filter((item) => item.readSeconds > 0)
    .sort((a, b) => b.readSeconds - a.readSeconds)
    .slice(0, 7)
    .map((item, index) => ({
      moduleId: item.moduleId,
      label: item.label,
      minutes: item.minutes,
      active: index < 3,
    }));
}

function getIstTodayParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const date = `${value("year")}-${value("month")}-${value("day")}`;
  return {
    date,
    day: value("weekday"),
    dateNumber: Number(value("day")) || 0,
  };
}

async function buildTodayEvents(): Promise<TodayEventsData> {
  const today = getIstTodayParts();
  const events = (await fetchGoogleCalendarEvents())
    .filter((event) => event.date === today.date)
    .slice(0, 4)
    .map((event) => ({
      title: event.title,
      location: event.venue,
      time: `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`,
    }));

  return {
    day: today.day,
    date: today.dateNumber,
    events,
  };
}

function milestoneStatus(done: boolean, started: boolean): JourneyMilestone["status"] {
  if (done) return "done";
  if (started) return "in_progress";
  return "not_started";
}

function buildJourney(
  progress: DashboardProgress,
  guideCount: number,
  completedGuideCount: number,
  completedModules: number,
  totalMandatoryModules: number,
  hasModuleProgress: boolean,
  isOnboarded: boolean,
  isTourComplete: boolean,
  nextModule: { title: string; href: string } | undefined
): { milestones: JourneyMilestone[]; nextUp: JourneyNextUp } {
  const guideStatus = milestoneStatus(
    guideCount > 0 && completedGuideCount >= guideCount,
    completedGuideCount > 0
  );
  const moduleStatus = milestoneStatus(
    totalMandatoryModules > 0 && completedModules >= totalMandatoryModules,
    hasModuleProgress
  );
  const chatVisited = !!progress.featureVisits.chat;
  const exploreVisited = !!progress.featureVisits.explore;

  const milestones: JourneyMilestone[] = [
    { label: "Welcome setup", status: isOnboarded ? "done" : "in_progress" },
    { label: "Product tour", status: isTourComplete ? "done" : "not_started" },
    {
      label: "Quick guides",
      status: guideStatus,
      subProgress: { done: completedGuideCount, total: guideCount },
    },
    {
      label: "Modules",
      status: moduleStatus,
      subProgress: { done: completedModules, total: totalMandatoryModules },
    },
    { label: "Ask Bijlee", status: progress.chatUsedAt ? "done" : chatVisited ? "in_progress" : "not_started" },
    { label: "Explore campus", status: progress.exploreUsedAt ? "done" : exploreVisited ? "in_progress" : "not_started" },
    { label: "Calendar check-in", status: progress.featureVisits.calendar ? "done" : "not_started" },
  ];

  const nextUpByLabel: Record<string, JourneyNextUp> = {
    "Welcome setup": {
      title: "Finish welcome setup",
      subtitle: "Add your onboarding details to personalize the hub.",
      href: "/home",
      ctaLabel: "Open Home →",
    },
    "Product tour": {
      title: "Take the product tour",
      subtitle: "Learn where the core orientation tools live.",
      href: "/dashboard",
      ctaLabel: "Start Tour →",
    },
    "Quick guides": {
      title: "Quick guides",
      subtitle: "Finish the short guides on your Home page.",
      href: "/home",
      ctaLabel: "Open Guides →",
    },
    Modules: {
      title: nextModule?.title ?? "Orientation modules",
      subtitle: "Continue the next mandatory module.",
      href: nextModule?.href ?? "/modules",
      ctaLabel: "Resume Module →",
    },
    "Ask Bijlee": {
      title: "Ask Bijlee",
      subtitle: "Send your first orientation question.",
      href: "/chat",
      ctaLabel: "Open Chat →",
    },
    "Explore campus": {
      title: "Explore campus",
      subtitle: "Like or dismiss one campus group to tune recommendations.",
      href: "/explore",
      ctaLabel: "Explore →",
    },
    "Calendar check-in": {
      title: "Calendar check-in",
      subtitle: "Check the latest orientation events.",
      href: "/calendar",
      ctaLabel: "Open Calendar →",
    },
  };

  const firstIncomplete = milestones.find((milestone) => milestone.status !== "done");
  return {
    milestones,
    nextUp: firstIncomplete ? nextUpByLabel[firstIncomplete.label] : {
      title: "Orientation journey complete",
      subtitle: "You are caught up on the tracked milestones.",
      href: "/modules",
      ctaLabel: "Review Modules →",
    },
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const [user, guides, todayEvents] = await Promise.all([
    (prisma.user as unknown as DashboardUserDelegate).findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        modulesStatus: true,
        moduleScores: true,
        dashboardProgress: true,
        isOnboarded: true,
        isTourComplete: true,
      },
    }),
    getGuidesMeta().catch((error) => {
      console.error("Error fetching guides for dashboard:", error);
      return [];
    }),
    buildTodayEvents(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const modulesStatus = parseModulesStatus(user.modulesStatus);
  const moduleScores = parseModuleScores(user.moduleScores);
  const progress = parseDashboardProgress(user.dashboardProgress);

  // Fetch all modules and games from the DB
  const dbModules = await prisma.module.findMany({
    include: {
      games: true,
    },
    orderBy: {
      orderIndex: "asc",
    },
  });

  const modules: MockModule[] = dbModules.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description,
    iconName: m.icon || "book-open",
    isMandatory: m.isMandatory,
    orderIndex: m.orderIndex,
    journeyMilestone: m.journeyMilestone,
    status: "not_started" as ModuleStatus,
    readPercent: 0,
    games: m.games
      .map((g) => ({
        id: g.id,
        title: g.title,
        type: g.type as GameType,
        difficulty: g.difficulty as Difficulty,
        pointsValue: g.pointsValue,
        estimatedMins: g.estimatedMins,
        config: g.config as unknown as MockGame["config"],
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  }));

  const mandatoryModules = modules.filter((module) => module.isMandatory);

  const moduleStates = mandatoryModules.map((module) => {
    const entry = getEntry(modulesStatus, module.id);
    const completed = moduleIsComplete(module, entry, moduleScores);
    const hasProgress = moduleHasProgress(entry);
    return { module, entry, completed, hasProgress };
  });

  const completedMandatoryModules = moduleStates.filter((state) => state.completed).length;
  const inProgressModules = moduleStates.filter((state) => !state.completed && state.hasProgress).length;
  const notStartedModules = moduleStates.length - completedMandatoryModules - inProgressModules;
  const nextIncompleteModule = moduleStates.find((state) => !state.completed)?.module;
  const nextModule = nextIncompleteModule
    ? { title: nextIncompleteModule.title, href: `/modules/${nextIncompleteModule.slug}/read` }
    : undefined;

  const moduleStats: ModuleStats = {
    total: mandatoryModules.length,
    completedWithGames: completedMandatoryModules,
    inProgress: inProgressModules,
    notStarted: Math.max(0, notStartedModules),
  };

  const guideIds = new Set(guides.map((guide) => guide.id));
  const completedGuideCount = progress.completedGuideIds.filter((id) => guideIds.has(id)).length;
  const journey = buildJourney(
    progress,
    guides.length,
    completedGuideCount,
    completedMandatoryModules,
    mandatoryModules.length,
    moduleStates.some((state) => state.hasProgress),
    user.isOnboarded,
    user.isTourComplete,
    nextModule
  );

  const data: DashboardData = {
    user: {
      name: user.name?.split(" ")[0] ?? "Ashokan Student",
      totalPoints: totalPoints(moduleScores),
    },
    timeSpendingData: buildTimeSpendingData(modulesStatus, modules),
    moduleStats,
    moduleCompletion: {
      percentage: mandatoryModules.length > 0
        ? Math.round((completedMandatoryModules / mandatoryModules.length) * 100)
        : 0,
      completed: completedMandatoryModules,
      total: mandatoryModules.length,
      nextModule,
    },
    todayEvents,
    journeyMilestones: journey.milestones,
    nextUp: journey.nextUp,
  };

  return <DashboardPageClient data={data} />;
}
