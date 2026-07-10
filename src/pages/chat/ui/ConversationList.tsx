import { FC } from "react";

import { FilterSample, SearchIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

import type { Conversation } from "../model/types";
import { ConversationItem } from "./ConversationItem";

type Props = {
  conversations: Conversation[];
  activeId: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: number) => void;
  className?: string;
};

export const ConversationList: FC<Props> = ({
  conversations,
  activeId,
  search,
  onSearchChange,
  onSelect,
  className,
}) => {
  const aiConversation = conversations.find((c) => c.isAi);
  const otherConversations = conversations.filter((c) => !c.isAi);

  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      {/* Search & Filter Row */}
      <div className="flex gap-2 shrink-0">
        <div className="flex-1 h-11 bg-white border border-border-soft rounded-full px-4 flex items-center gap-2 shadow-sm">
          <SearchIcon className="size-4 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Поиск"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full outline-none bg-transparent text-foreground text-sm placeholder:text-muted"
          />
        </div>
        <button
          type="button"
          aria-label="Фильтр"
          className="size-11 p-0 border border-border-soft bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shrink-0 shadow-sm text-secondary"
        >
          <FilterSample className="size-5" />
        </button>
      </div>

      {/* AI Assistant Card */}
      {aiConversation && (
        <div className="bg-white border border-border-soft rounded-3xl p-1 shrink-0 shadow-sm">
          <ConversationItem
            conversation={aiConversation}
            isActive={aiConversation.id === activeId}
            onSelect={() => onSelect(aiConversation.id)}
          />
        </div>
      )}

      {/* Other Chats Card List */}
      <div className="bg-white border border-border-soft rounded-3xl p-2.5 shadow-sm flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-hide">
        {otherConversations.length === 0 ? (
          <p className="text-center text-sm text-muted py-8">Чаты не найдены</p>
        ) : (
          otherConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeId}
              onSelect={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
