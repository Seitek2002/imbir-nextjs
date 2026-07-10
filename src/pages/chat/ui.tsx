"use client";

import { FC, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

// One-shot query params, read on the client only — this workspace mounts after
// the auth gate, so there is no SSR pass to mismatch against.
// `?ask=` — a symptom typed on the home hero, goes to the AI assistant.
// `?room=` — a room id to open right away (e.g. after "Написать" on a doctor page).
const readAsk = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return (
    new URLSearchParams(window.location.search).get("ask")?.trim() || undefined
  );
};

const readRoomParam = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("room");
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
};

const ChatWorkspace: FC<{ currentUserId: number }> = ({ currentUserId }) => {
  const router = useRouter();
  const [pendingAsk, setPendingAsk] = useState<string | undefined>(readAsk);
  const [activeId, setActiveId] = useState<number | null>(() =>
    pendingAsk ? AI_ROOM_ID : readRoomParam(),
  );
  const [search, setSearch] = useState("");

  // Strip the one-shot params so a refresh doesn't repeat them (no state change).
  useEffect(() => {
    if (window.location.search)
      window.history.replaceState(null, "", ROUTES.CHATS);
  }, []);

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
      {activeId === null && (
        <div className="md:hidden">
          <Header title="Чаты" onBack={() => router.push(ROUTES.HOME)} />
        </div>
      )}

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <h1 className="hidden md:block text-[28px] font-semibold text-foreground mb-6">
          Чаты
        </h1>

        <div className="flex flex-1 gap-5 md:h-[calc(100vh-220px)] min-h-150">
          <aside
            className={cn(
              "w-full md:w-85 lg:w-92.5 shrink-0 flex flex-col",
              activeId !== null && "hidden md:block",
            )}
          >
            <ConversationList
              className="flex-1"
              conversations={filtered}
              activeId={activeId}
              search={search}
              onSearchChange={setSearch}
              onSelect={setActiveId}
            />
          </aside>

          <section
            className={cn(
              "flex-1 bg-white flex flex-col overflow-hidden md:border md:border-border-soft md:rounded-[32px] shadow-sm",
              activeConversation ? "flex" : "hidden md:flex",
            )}
          >
            {activeConversation?.isAi ? (
              <AiConversation
                onBack={() => setActiveId(null)}
                initialMessage={pendingAsk}
                onInitialSent={() => setPendingAsk(undefined)}
              />
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
