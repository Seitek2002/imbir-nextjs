import { FC, ReactNode } from "react";

import { HeaderBackIcon, TrashIcon } from "@/shared/assets/icons";

import { ChatAvatar } from "./ChatAvatar";

type Props = {
  name: string;
  isAi: boolean;
  subtitle?: ReactNode;
  onBack: () => void;
  onClear?: () => void;
};

export const ChatHeader: FC<Props> = ({
  name,
  isAi,
  subtitle,
  onBack,
  onClear,
}) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="Назад к списку чатов"
        className="md:hidden flex items-center justify-center size-9 rounded-full hover:bg-gray-50 text-foreground"
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

    {onClear && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Очистить историю"
        className="flex items-center justify-center size-9 rounded-full hover:bg-background transition-colors text-muted hover:text-foreground"
      >
        <TrashIcon className="size-5" />
      </button>
    )}
  </div>
);
