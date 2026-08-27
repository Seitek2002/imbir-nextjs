import { FC } from "react";

type Props = {
  /** Сколько записей ждут реакции. 0 — бейдж не рендерится. */
  count: number;
};

/**
 * Счётчик у пункта меню кабинета. Синий — тот же акцент, которым в списке
 * подсвечена сама новая запись, чтобы пользователь связал одно с другим.
 *
 * Колокольчик в шапке сюда не ставим намеренно: на узких экранах он ломает
 * раскладку хедера. Счётчик живёт внутри уже существующей строки меню, поэтому
 * ширину ничего не меняет.
 */
export const NavBadge: FC<Props> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <span
      className="shrink-0 min-w-6 h-6 px-1.5 rounded-full bg-info text-white text-xs font-semibold inline-flex items-center justify-center tabular-nums"
      aria-label={`Новых записей: ${count}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};
