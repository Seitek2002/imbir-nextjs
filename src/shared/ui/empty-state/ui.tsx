import { FC, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  action?: ReactNode;
  className?: string;
  description?: string;
  icon?: ReactNode;
  title: string;
};

// Экран «здесь ничего нет» — общий для тупиковых состояний: не найденная
// карточка врача или клиники, пустой список. Раньше каждое такое место писало
// свой голый текст по центру, из-за чего они выглядели как недогрузившаяся
// страница, а не как осмысленный ответ.
//
// Пунктирная рамка и плитка с иконкой — та же подача, что у пустых отзывов,
// чтобы состояния не выглядели из разных приложений.
export const EmptyState: FC<Props> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      "bg-white border border-border-soft border-dashed rounded-3xl flex flex-col items-center justify-center text-center px-6 py-14 gap-3",
      className,
    )}
  >
    {icon && (
      <div className="size-14 rounded-2xl bg-[#FFF0EE] flex items-center justify-center text-primary">
        {icon}
      </div>
    )}
    <p className="text-foreground font-semibold text-lg">{title}</p>
    {description && (
      <p className="text-muted text-sm max-w-80">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
