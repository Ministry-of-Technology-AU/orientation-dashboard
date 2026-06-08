import { NextResponse } from "next/server";
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar";

export const revalidate = 300; // ISR: refresh every 5 minutes

export async function GET() {
  const events = await fetchGoogleCalendarEvents();
  return NextResponse.json(events, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
