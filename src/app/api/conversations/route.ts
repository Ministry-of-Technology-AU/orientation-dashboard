import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;
const GW_HEADERS = {
  "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
  "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
};

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${GATEWAY}/conversations`, { headers: GW_HEADERS });
  const body = await res.json();
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 502 });
  return NextResponse.json(body);
}
