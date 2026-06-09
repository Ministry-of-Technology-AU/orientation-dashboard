import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  if (session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const faqs = await prisma.faqDocument.findMany({
    orderBy: [{ category: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(faqs);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, category, content } = (await req.json()) as {
    title: string;
    category: string;
    content: string;
  };

  if (!title?.trim() || !category?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title, category, and content are required" }, { status: 400 });
  }

  const faq = await prisma.faqDocument.create({
    data: { title: title.trim(), category: category.trim(), content: content.trim() },
  });
  return NextResponse.json(faq, { status: 201 });
}
