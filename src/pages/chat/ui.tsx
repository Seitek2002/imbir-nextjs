"use client";

import { FC, useMemo, useState } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Header } from "@/widgets/header";

import { chatKeys, getChatRooms } from "@/shared/api";
import { ChatIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/shared/ui";

import { AI_ASSISTANT_NAME, AI_ROOM_ID } from "./model/constants";
import { roomToConversation } from "./model/lib";
import type { Conversation } from "./model/types";
import { AiConversation } from "./ui/AiConversation";
import { ConversationList } from "./ui/ConversationList";
import { UserConversation } from "./ui/UserConversation";

const AI_CONVERSATION: Conversation = {
  id: AI_ROOM_ID,
  name: AI_ASSISTANT_NAME,
  lastMessage: "",
  lastMessageAt: null,
  isAi: true,
};

const PageShell: FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="min-h-screen bg-background flex flex-col">
    <div className="hidden md:block">
      <Header />
    </div>
    {children}
  </main>
);

const LoginPrompt = () => (
  <PageShell>
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-border-soft p-8 w-full max-w-sm text-center flex flex-col items-center gap-4">
        <div className="size-14 rounded-full bg-primary-tint flex items-center justify-center">
          <ChatIcon className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Войдите, чтобы открыть чаты
          </h2>
          <p className="text-sm text-muted mt-1">
            Сообщения и ИИ-помощник доступны авторизованным пользователям.
          </p>
        </div>
        <Link href={ROUTES.LOGIN} className="w-full">
          <Button className="w-full justify-center" size="lg">
            Войти
          </Button>
        </Link>
      </div>
    </div>
  </PageShell>
);

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3 p-8">
    <div className="size-16 bg-background rounded-full flex items-center justify-center">
      <ChatIcon className="size-7" />
    </div>
    <p className="text-sm">Выберите чат, чтобы начать общение</p>
  </div>
);

const ChatWorkspace: FC<{ currentUserId: number }> = ({ currentUserId }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: rooms } = useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: getChatRooms,
  });

  const conversations = useMemo(
    () => [
      AI_CONVERSATION,
      ...(rooms ?? []).map((room) => roomToConversation(room, currentUserId)),
    ],
    [rooms, currentUserId],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  const activeConversation =
    conversations.find((item) => item.id === activeId) ?? null;

  return (
    <PageShell>
      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <h1 className="hidden md:block text-[28px] font-semibold text-foreground mb-6">
          Чаты
        </h1>

        <div className="flex flex-1 gap-5 md:h-[calc(100vh-220px)] min-h-150">
          <aside
            className={cn(
              "w-full md:w-85 lg:w-92.5 shrink-0",
              activeId !== null && "hidden md:block",
            )}
          >
            <ConversationList
              className="h-full p-4 md:p-0"
              conversations={filtered}
              activeId={activeId}
              search={search}
              onSearchChange={setSearch}
              onSelect={setActiveId}
            />
          </aside>

          <section
            className={cn(
              "flex-1 bg-white border border-border-soft rounded-3xl flex-col overflow-hidden",
              activeConversation ? "flex" : "hidden md:flex",
            )}
          >
            {activeConversation?.isAi ? (
              <AiConversation onBack={() => setActiveId(null)} />
            ) : activeConversation ? (
              <UserConversation
                key={activeConversation.id}
                roomId={activeConversation.id}
                name={activeConversation.name}
                currentUserId={currentUserId}
                onBack={() => setActiveId(null)}
              />
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
};

export const ChatPage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <LoginPrompt />;

  return <ChatWorkspace currentUserId={user.id} />;
};
