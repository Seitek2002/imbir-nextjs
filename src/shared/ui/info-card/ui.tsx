"use client";

import { FC, ReactNode, useCallback, useRef, useState } from "react";

// Путь до твоей кнопки
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

type Props = {
  title: string;
  children: ReactNode;
  expandable?: boolean; // Разрешить сворачивание, если текст длиннее lines
  lines?: number; // Сколько строк показывать в закрытом состоянии (по умолчанию 3)
};

export const InfoCard: FC<Props> = ({
  title,
  children,
  expandable = false,
  lines = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Текст реально обрезан? Раньше кнопка "Подробнее" рендерилась всегда при
  // expandable, и на коротком описании (влезает в lines строк) клик по ней
  // ничего не менял — она просто занимала место.
  const [isClamped, setIsClamped] = useState(false);
  // Состояние читаем из ref, а не из замыкания: ResizeObserver вешается один
  // раз, а в раскрытом виде clamp снят и измерять нечего.
  const isExpandedRef = useRef(false);

  const contentRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const measure = () => {
        if (isExpandedRef.current) return;
        // 1px — запас на дробную высоту строки при масштабировании страницы.
        setIsClamped(el.scrollHeight - el.clientHeight > 1);
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    },
    // children в колбэке не используется, но нужен в зависимостях: при смене
    // контента React отцепит и заново прицепит ref, то есть перемерит.
    // ResizeObserver сам этого не заметил бы — в свёрнутом виде высота блока
    // зафиксирована обрезкой и при другом тексте не меняется.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children],
  );

  const canToggle = expandable && (isClamped || isExpanded);

  const handleToggle = () => {
    isExpandedRef.current = !isExpanded;
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-[20px] p-4 border border-border-soft">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {canToggle && (
          <Button
            variant="text"
            className="text-sm text-primary hover:text-primary-dark px-0 h-auto font-medium"
            onClick={handleToggle}
          >
            {isExpanded ? "Скрыть" : "Подробнее"}
          </Button>
        )}
      </div>

      {/* Контейнер для контента. Используем инлайн-стили для line-clamp, чтобы можно было передавать любое число строк */}
      <div
        ref={expandable ? contentRef : undefined}
        className={cn(
          "text-muted text-sm md:text-base leading-relaxed transition-all duration-300",
          // Если есть children сложной структуры (не текст), line-clamp не сработает, но для текста это идеальное решение
        )}
        style={
          expandable && !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}
        }
      >
        {children}
      </div>
    </div>
  );
};
