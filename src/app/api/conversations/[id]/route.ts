import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let res: Response;
  try {
    res = await fetch(`${GATEWAY}/conversations/${id}`, {
      headers: {
        "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
        "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
        "X-User-Email": session.user.email,
      },
    });
  } catch (err) {
    console.error(`[gateway] GET /conversations/${id} — network error:`, err);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 502 });
  }

  const body = await res.json();
  if (!res.ok) {
    console.error(`[gateway] GET /conversations/${id} — HTTP ${res.status}:`, JSON.stringify(body));
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 502 });
  }

  console.log(`[gateway] GET /conversations/${id} — OK ${res.status}`);
  return NextResponse.json(body);
}
