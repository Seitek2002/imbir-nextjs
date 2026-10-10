"use client";

import { FC, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  SearchHistory,
  SearchRemoveHistory,
  TrashIcon,
} from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useMounted } from "@/shared/lib/useMounted";
import { useSearchHistoryStore } from "@/shared/store";
import { ConfirmDialog, IconBtn } from "@/shared/ui";

type Props = {
  // Сообщает панели, что открыт диалог подтверждения: он живёт в портале вне
  // панели, и клики по нему не должны закрывать поиск.
  onDialogChange?: (open: boolean) => void;
  // Закрыть панель после перехода: на /search страница не перемонтируется,
  // и без этого панель осталась бы открытой поверх новой выдачи.
  onNavigate?: () => void;
};

export const RecentSearches: FC<Props> = ({ onNavigate, onDialogChange }) => {
  const router = useRouter();
  const { history, removeSearch, clearHistory } = useSearchHistoryStore();

  const mounted = useMounted();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleConfirm = (open: boolean) => {
    setConfirmOpen(open);
    onDialogChange?.(open);
  };

  // Если компонент исчезнет при открытом диалоге (например, пользователь начал
  // печатать запрос), панель не должна остаться «запертой».
  useEffect(() => () => onDialogChange?.(false), [onDialogChange]);

  const handleSearch = (query: string) => {
    router.push(ROUTES.SEARCH({ query }));
    onNavigate?.();
  };

  if (!mounted || history.length === 0) return null;

  return (
    <>
      <div className="bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground text-lg font-medium">
            Недавно искали
          </h2>
          <button
            onClick={() => toggleConfirm(true)}
            className="text-primary text-base active:scale-95 transition-transform hover:opacity-80"
          >
            Удалить все
          </button>
        </div>

        <ul className="flex flex-col gap-4">
          {history.map((item) => (
            <li key={item} className="flex items-center justify-between group">
              <button
                onClick={() => handleSearch(item)}
                className="flex items-center gap-3 flex-1 text-left hover:opacity-70 transition-opacity"
              >
                <SearchHistory className="size-5 text-muted shrink-0" />
                <span className="text-foreground text-base truncate">
                  {item}
                </span>
              </button>

              <IconBtn
                variant="outline"
                className="shrink-0 ml-2"
                onClick={() => removeSearch(item)}
              >
                <SearchRemoveHistory className="size-3" />
              </IconBtn>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => toggleConfirm(false)}
        // После очистки история пуста и компонент вместе с диалогом
        // размонтируется, не дождавшись onClose, — сбрасываем флаг сразу.
        onConfirm={() => {
          clearHistory();
          toggleConfirm(false);
        }}
        icon={<TrashIcon className="w-7 h-7 text-primary" />}
        title="Удалить историю поиска?"
        description="История будет удалена без возможности восстановления"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </>
  );
};
