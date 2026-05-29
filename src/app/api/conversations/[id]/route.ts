import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;
const GW_HEADERS = {
  "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
  "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const res = await fetch(`${GATEWAY}/conversations/${id}`, { headers: GW_HEADERS });
  const body = await res.json();
  if (!res.ok)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 502 });
  return NextResponse.json(body);
}
