/**
 * Server-only Google Calendar fetcher — Strategy B (API Key).
 * Uses the Google Calendar v3 REST API with a plain fetch (no extra npm packages).
 * Falls back to mock events if GOOGLE_CALENDAR_API_KEY or GOOGLE_CALENDAR_ID are not set.
 */

import type { CalendarEvent, EventCategory } from "@/mock-data/calendar";
import { mockEvents } from "@/mock-data/calendar";

// ─── Types from Google Calendar API v3 ────────────────────────────────────────

interface GCalDateTime {
  dateTime?: string; // ISO 8601 with timezone, e.g. "2026-06-08T10:00:00+05:30"
  date?: string;     // All-day events: "YYYY-MM-DD"
  timeZone?: string;
}

interface GCalEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GCalDateTime;
  end: GCalDateTime;
  organizer?: { displayName?: string; email?: string };
  status?: string;
}

interface GCalEventsResponse {
  items?: GCalEvent[];
  error?: { message: string; code: number };
}

// ─── Category classifier ───────────────────────────────────────────────────────

const MANDATORY_KEYWORDS = [
  "mandatory", "required", "compulsory", "orientation", "induction",
  "registration", "assembly", "briefing", "policy", "cash", "dean",
  "registrar", "academic", "seminar", "internship",
];

const SOCIAL_KEYWORDS = [
  "social", "party", "club", "society", "fair", "cultural", "music",
  "dance", "comedy", "fest", "night", "showcase", "art", "open mic",
  "mun", "hackathon", "ubuntu", "dorm", "welcome",
];

const SPORTS_KEYWORDS = [
  "sport", "sports", "cricket", "football", "basketball", "volleyball",
  "yoga", "gym", "fitness", "athletics", "tournament", "match", "game",
  "wellness", "run", "swim",
];

function classifyCategory(title: string, description: string): EventCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (MANDATORY_KEYWORDS.some((kw) => text.includes(kw))) return "mandatory";
  if (SPORTS_KEYWORDS.some((kw) => text.includes(kw))) return "sports";
  if (SOCIAL_KEYWORDS.some((kw) => text.includes(kw))) return "social";
  return "misc";
}

// ─── Date / time helpers ───────────────────────────────────────────────────────

function extractDateStr(dt: GCalDateTime): string {
  if (dt.date) return dt.date; // all-day
  if (dt.dateTime) {
    // Parse ISO 8601 to local date string YYYY-MM-DD
    const d = new Date(dt.dateTime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function extractTimeStr(dt: GCalDateTime): string {
  if (dt.date) return "00:00"; // all-day events — no specific time
  if (dt.dateTime) {
    const d = new Date(dt.dateTime);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return "00:00";
}

// ─── Main fetcher ──────────────────────────────────────────────────────────────

export async function fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  // Graceful fallback: if env vars not set, use mock data
  if (!calendarId || !apiKey) {
    console.warn("[google-calendar] ENV vars not set — using mock data fallback.");
    return mockEvents;
  }

  // Fetch window: today → 90 days ahead
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    key: apiKey,
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[google-calendar] API error ${res.status}: ${body}`);
      return mockEvents; // fallback
    }

    const data: GCalEventsResponse = await res.json();

    if (data.error) {
      console.error(`[google-calendar] API returned error: ${data.error.message}`);
      return mockEvents; // fallback
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Map Google Calendar events → CalendarEvent shape
    const events: CalendarEvent[] = data.items
      .filter((ev) => ev.status !== "cancelled" && ev.summary)
      .map((ev) => {
        const title = ev.summary ?? "Untitled Event";
        const description = (ev.description ?? "").replace(/<[^>]*>/g, "").slice(0, 500).trim();
        const venue = ev.location ?? "TBC";
        const organisingBody =
          ev.organizer?.displayName ?? ev.organizer?.email?.split("@")[0] ?? "Ashoka University";

        return {
          id: ev.id,
          title,
          date: extractDateStr(ev.start),
          startTime: extractTimeStr(ev.start),
          endTime: extractTimeStr(ev.end),
          venue,
          organisingBody,
          description: description || "No description provided.",
          category: classifyCategory(title, description),
        };
      });

    return events;
  } catch (err) {
    console.error("[google-calendar] Fetch failed:", err);
    return mockEvents; // fallback
  }
}
