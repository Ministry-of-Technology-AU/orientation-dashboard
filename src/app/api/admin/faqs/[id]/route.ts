import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  if (session.user.role !== "admin") return null;
  return session;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { title, category, content } = (await req.json()) as {
    title: string;
    category: string;
    content: string;
  };

  if (!title?.trim() || !category?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title, category, and content are required" }, { status: 400 });
  }

  try {
    const faq = await prisma.faqDocument.update({
      where: { id },
      data: { title: title.trim(), category: category.trim(), content: content.trim() },
    });
    return NextResponse.json(faq);
  } catch {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.faqDocument.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }
}
