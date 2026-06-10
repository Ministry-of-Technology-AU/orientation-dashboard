import { NextRequest, NextResponse } from "next/server";
import { getGuideContent } from "@/lib/notion";

export const revalidate = 3600; // Cache for 1 hour — guide body rarely changes

/** Basic UUID-like validation to prevent arbitrary Notion API calls */
function isValidNotionId(id: string): boolean {
  // Notion page IDs are 32-char hex (sometimes with hyphens from URL)
  const stripped = id.replace(/-/g, "");
  return /^[0-9a-f]{32}$/i.test(stripped);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !isValidNotionId(id)) {
    return NextResponse.json(
      { error: "Invalid guide ID" },
      { status: 400 }
    );
  }

  try {
    const markdown = await getGuideContent(id);
    return NextResponse.json({ markdown });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Notion returns a 404-like error for missing pages
    if (message.includes("Could not find") || message.includes("not found")) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    console.error(`[/api/guides/${id}] Failed to fetch guide content:`, err);
    return NextResponse.json(
      { error: "Failed to fetch guide content" },
      { status: 500 }
    );
  }
}
