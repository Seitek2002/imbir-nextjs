"use client";

import { FC } from "react";

import { SearchIcon } from "@/shared/assets/icons";
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
}) => (
  <div className={cn("flex flex-col gap-3", className)}>
    <div className="bg-white border border-border-soft rounded-full px-4 py-2.5 flex items-center gap-2">
      <SearchIcon className="size-4 text-muted shrink-0" />
      <input
        type="text"
        placeholder="Поиск"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full outline-none bg-transparent text-foreground text-sm placeholder:text-muted"
      />
    </div>

    <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4 md:pb-0 scrollbar-hide">
      {conversations.length === 0 ? (
        <p className="text-center text-sm text-muted mt-8">Чаты не найдены</p>
      ) : (
        conversations.map((conversation) => (
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
