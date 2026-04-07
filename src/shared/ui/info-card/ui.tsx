"use client";

import { FC, ReactNode, useState } from "react";

// Путь до твоей кнопки
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

type Props = {
  title: string;
  children: ReactNode;
  expandable?: boolean; // Нужна ли кнопка "Подробнее"
  lines?: number; // Сколько строк показывать в закрытом состоянии (по умолчанию 3)
};

export const InfoCard: FC<Props> = ({
  title,
  children,
  expandable = false,
  lines = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#191A1B]">{title}</h3>
        {expandable && (
          <Button
            variant="text"
            className="text-sm text-[#F5653E] hover:text-[#D94F2B] px-0 h-auto font-medium"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Скрыть" : "Подробнее"}
          </Button>
        )}
      </div>

      {/* Контейнер для контента. Используем инлайн-стили для line-clamp, чтобы можно было передавать любое число строк */}
      <div
        className={cn(
          "text-[#838A8D] text-sm md:text-base leading-relaxed transition-all duration-300",
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
