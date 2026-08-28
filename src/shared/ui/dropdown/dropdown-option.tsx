import { FC } from "react";

import { DropdownCheckIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { Checkbox, Radio } from "@/shared/ui";

import { DropdownType, Option } from "./types";

type OptionProps = {
  // id приходит сверху: на странице несколько дропдаунов, и локальный
  // счётчик дал бы одинаковые id в каждом.
  id: string;
  index: number;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
  option: Option;
  type: DropdownType;
};

export const DropdownOption: FC<OptionProps> = ({
  option,
  type,
  id,
  index,
  isSelected,
  isHighlighted,
  onClick,
  onHover,
}) => {
  return (
    // Пункт остаётся div: фокус мы держим на триггере и указываем на активный
    // пункт через aria-activedescendant, поэтому tabIndex здесь не нужен —
    // иначе Tab уводил бы фокус внутрь списка мимо триггера.
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      data-dd-index={index}
      onClick={onClick}
      // Мышь и клавиатура ведут одну и ту же подсветку, иначе после
      // наведения курсора Enter срабатывал бы по другому пункту.
      onMouseMove={onHover}
      className={cn(
        "p-4 md:px-3 md:py-2.5 flex items-center justify-between cursor-pointer transition-colors",
        "border-b border-border-soft last:border-b-0 md:border-none",
        isSelected && type === "default" && "md:bg-background",
        isHighlighted && "md:bg-background",
      )}
    >
      <span className="text-foreground text-base md:text-sm flex-1">
        {option.label}
      </span>

      {type === "checkbox" && (
        <div className="pointer-events-none">
          <Checkbox checked={isSelected} readOnly />
        </div>
      )}

      {type === "radio" && (
        <div className="pointer-events-none">
          <Radio checked={isSelected} readOnly />
        </div>
      )}

      {type === "default" && isSelected && (
        <DropdownCheckIcon className="size-5 md:size-3.5 text-primary md:text-foreground animate-in zoom-in duration-200" />
      )}
    </div>
  );
};
