import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let res: Response;
  try {
    res = await fetch(`${GATEWAY}/conversations`, {
      headers: {
        "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
        "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
        "X-User-Email": session.user.email,
      },
    });
  } catch (err) {
    console.error("[gateway] GET /conversations — network error:", err);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 502 });
  }

  const body = await res.json();
  if (!res.ok) {
    console.error(`[gateway] GET /conversations — HTTP ${res.status}:`, JSON.stringify(body));
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 502 });
  }

  console.log(`[gateway] GET /conversations — OK ${res.status}`);
  return NextResponse.json(body);
}
