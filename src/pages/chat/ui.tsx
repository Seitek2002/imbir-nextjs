"use client";

import { FC, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

// h-dvh + overflow-hidden фиксируют страницу по высоте вьюпорта, чтобы
// прокручивались только внутренние панели (лента чата и список переписок),
// а не вся страница. dvh корректно учитывает адресную строку в мобильном
// webview (важно для Capacitor).
const PageShell: FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="h-dvh overflow-hidden bg-background flex flex-col">
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

// Одноразовые параметры входа в чат:
//   ?ask=<текст> — симптом с главной: открыть ИИ-помощника и сразу отправить
//   ?ai=1        — просто открыть ИИ-помощника («Перейти в чат» на главной)
//   ?room=<id>   — открыть переписку с пользователем (кнопка «Написать»)
//
// Раньше это читалось императивно из window.location внутри инициализатора
// useState. Так делать нельзя: ChatWorkspace монтируется НЕ на первом рендере
// страницы — до гидратации persist-стора `user` ещё null и рендерится
// LoginPrompt (см. ChatPage внизу файла). Инициализатор срабатывал в момент,
// который ничем не гарантирован, и параметр терялся. useSearchParams реактивен
// и отдаёт значение независимо от того, когда воркспейс смонтировался.
type EntryParams = { ask?: string; roomId: number | null };

// «Чат не выбран» — это null, а не 0: у ИИ-помощника id именно 0
// (AI_ROOM_ID), поэтому проверять roomId на truthy нельзя.
const readEntryParams = (params: URLSearchParams): EntryParams => {
  const ask = params.get("ask")?.trim() || undefined;
  if (ask || params.get("ai") === "1") return { ask, roomId: AI_ROOM_ID };

  const id = Number(params.get("room"));
  return { roomId: Number.isInteger(id) && id > 0 ? id : null };
};

const ChatWorkspace: FC<{ currentUserId: number }> = ({ currentUserId }) => {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const { ask: askParam, roomId: entryRoomId } = readEntryParams(searchParams);

  const [pendingAsk, setPendingAsk] = useState<string | undefined>(askParam);
  const [activeId, setActiveId] = useState<number | null>(entryRoomId);
  const [search, setSearch] = useState("");

  // Чистим одноразовые параметры из URL — уже ПОСЛЕ того, как они прочитаны в
  // состояние выше, иначе перезагрузка страницы повторно отправила бы симптом.
  // replaceState не уведомляет роутер Next, поэтому useSearchParams не отдаст
  // пустое значение и состояние не сбросится.
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", ROUTES.CHATS);
    }
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

      <div className="flex-1 min-h-0 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <h1 className="hidden md:block text-[28px] font-semibold text-foreground mb-6">
          Чаты
        </h1>

        <div className="flex flex-1 min-h-0 gap-5">
          <aside
            className={cn(
              "w-full md:w-85 lg:w-92.5 shrink-0 min-h-0 flex flex-col",
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
              "flex-1 min-h-0 bg-white flex flex-col overflow-hidden md:border md:border-border-soft md:rounded-[32px] shadow-sm",
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
                partnerId={activeConversation.partnerId}
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
