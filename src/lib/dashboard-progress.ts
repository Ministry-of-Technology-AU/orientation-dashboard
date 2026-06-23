export const DASHBOARD_FEATURES = ["home", "modules", "chat", "calendar", "explore"] as const;

export type DashboardFeature = (typeof DASHBOARD_FEATURES)[number];

export interface FeatureVisit {
  count: number;
  lastVisitedAt: string;
}

export interface DashboardProgress {
  completedGuideIds: string[];
  featureVisits: Partial<Record<DashboardFeature, FeatureVisit>>;
  chatUsedAt?: string;
  exploreUsedAt?: string;
}

export function isDashboardFeature(value: unknown): value is DashboardFeature {
  return typeof value === "string" && DASHBOARD_FEATURES.includes(value as DashboardFeature);
}

function parseFeatureVisits(value: unknown): DashboardProgress["featureVisits"] {
  if (!value || typeof value !== "object") return {};

  const visits: DashboardProgress["featureVisits"] = {};
  const rawVisits = value as Record<string, unknown>;

  for (const feature of DASHBOARD_FEATURES) {
    const visit = rawVisits[feature];
    if (!visit || typeof visit !== "object") continue;

    const rawVisit = visit as Record<string, unknown>;
    const count = typeof rawVisit.count === "number" && Number.isFinite(rawVisit.count)
      ? Math.max(0, Math.floor(rawVisit.count))
      : 0;
    const lastVisitedAt = typeof rawVisit.lastVisitedAt === "string" ? rawVisit.lastVisitedAt : "";

    if (count > 0 && lastVisitedAt) {
      visits[feature] = { count, lastVisitedAt };
    }
  }

  return visits;
}

export function parseDashboardProgress(raw: unknown): DashboardProgress {
  if (!raw || typeof raw !== "object") {
    return { completedGuideIds: [], featureVisits: {} };
  }

  const value = raw as Record<string, unknown>;
  const completedGuideIds = Array.isArray(value.completedGuideIds)
    ? [...new Set(value.completedGuideIds.filter((id): id is string => typeof id === "string" && id.length > 0))]
    : [];

  return {
    completedGuideIds,
    featureVisits: parseFeatureVisits(value.featureVisits),
    chatUsedAt: typeof value.chatUsedAt === "string" ? value.chatUsedAt : undefined,
    exploreUsedAt: typeof value.exploreUsedAt === "string" ? value.exploreUsedAt : undefined,
  };
}

export function markFeatureVisit(
  progress: DashboardProgress,
  feature: DashboardFeature,
  visitedAt: string
): DashboardProgress {
  const current = progress.featureVisits[feature];
  return {
    ...progress,
    featureVisits: {
      ...progress.featureVisits,
      [feature]: {
        count: (current?.count ?? 0) + 1,
        lastVisitedAt: visitedAt,
      },
    },
  };
}

export function setGuideCompletion(
  progress: DashboardProgress,
  guideId: string,
  completed: boolean
): DashboardProgress {
  const ids = new Set(progress.completedGuideIds);
  if (completed) ids.add(guideId);
  else ids.delete(guideId);

  return {
    ...progress,
    completedGuideIds: [...ids],
  };
}

export function markChatUsed(progress: DashboardProgress, usedAt: string): DashboardProgress {
  return {
    ...markFeatureVisit(progress, "chat", usedAt),
    chatUsedAt: usedAt,
  };
}

export function markExploreUsed(progress: DashboardProgress, usedAt: string): DashboardProgress {
  return {
    ...markFeatureVisit(progress, "explore", usedAt),
    exploreUsedAt: usedAt,
  };
}
