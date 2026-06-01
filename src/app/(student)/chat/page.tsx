import { auth } from "@/lib/auth";
import { ChatPageClient } from "@/components/chat/chat-page-client";

export default async function ChatPage() {
  const session = await auth();
  return (
    <ChatPageClient
      userImage={session?.user?.image ?? null}
      userName={session?.user?.name ?? null}
    />
  );
}
