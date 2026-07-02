import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatPageClient } from "@/components/chat/chat-page-client";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await auth();
  
  const dbFaqs = await prisma.faqDocument.findMany({
    select: {
      id: true,
      category: true,
      title: true,
      content: true,
    },
    orderBy: [
      { category: "asc" },
      { title: "asc" },
    ],
  });

  return (
    <ChatPageClient
      userImage={session?.user?.image ?? null}
      userName={session?.user?.name ?? null}
      dbFaqs={dbFaqs}
    />
  );
}

