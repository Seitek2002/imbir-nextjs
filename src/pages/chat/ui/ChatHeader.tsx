import { FC, ReactNode } from "react";

import {
  DocumentTextIcon,
  HeaderBackIcon,
  TrashIcon,
} from "@/shared/assets/icons";

import { ChatAvatar } from "./ChatAvatar";

type Props = {
  name: string;
  isAi: boolean;
  subtitle?: ReactNode;
  onBack: () => void;
  onClear?: () => void;
  // Итоги видео-консультаций с этим собеседником. Кнопки нет, если итогов
  // взять негде (чат с ИИ, роль «клиника»).
  onOpenSummaries?: () => void;
};

export const ChatHeader: FC<Props> = ({
  name,
  isAi,
  subtitle,
  onBack,
  onClear,
  onOpenSummaries,
}) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="Назад к списку чатов"
        className="md:hidden flex items-center justify-center size-9 p-0 rounded-full hover:bg-gray-50 text-foreground"
      >
        <HeaderBackIcon className="size-5" />
      </button>
      <ChatAvatar name={name} isAi={isAi} size={40} />
      <div className="min-w-0">
        <p className="font-semibold text-foreground text-sm leading-tight truncate">
          {name}
        </p>
        {subtitle && (
          <div className="text-xs leading-tight mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {onOpenSummaries && (
        <button
          type="button"
          onClick={onOpenSummaries}
          aria-label="Итоги видео-консультаций"
          title="Итоги видео-консультаций"
          className="flex items-center justify-center size-10 rounded-xl border border-border-soft text-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          <DocumentTextIcon className="size-5" />
        </button>
      )}

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Очистить историю"
          className="flex items-center justify-center size-9 p-0 rounded-full hover:bg-background transition-colors text-muted hover:text-foreground"
        >
          <TrashIcon className="size-5" />
        </button>
      )}
    </div>
  </div>
);
