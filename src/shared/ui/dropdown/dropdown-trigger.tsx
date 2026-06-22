import { FC } from "react";

import { DropdownArrowIcon, DropdownRemoveIcon } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";

import { Option } from "./types";

type TriggerProps = {
  isActive: boolean;
  isMulti: boolean;
  value?: string | string[];
  options: Option[];
  placeholder: string;
  onToggle: () => void;
  onRemove: (val: string) => void;
};

export const DropdownTrigger: FC<TriggerProps> = ({
  isActive,
  isMulti,
  value,
  options,
  placeholder,
  onToggle,
  onRemove,
}) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between min-h-10.5 p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white select-none",
        "border-border-soft",
        isActive
          ? "border-primary shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]"
          : "hover:border-primary/50",
      )}
    >
      <div className="flex flex-wrap gap-1.5 flex-1 overflow-hidden">
        {isMulti && Array.isArray(value) && value.length > 0 ? (
          value.map((val) => (
            <div
              key={val}
              className="flex items-center gap-1 px-2 py-0.5 border border-border-soft rounded-md bg-white text-sm"
            >
              {options.find((o) => o.value === val)?.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(val);
                }}
                className="hover:text-primary transition-colors"
              >
                <DropdownRemoveIcon className="size-3.5" />
              </button>
            </div>
          ))
        ) : (
          <span className={cn(value ? "text-foreground" : "text-muted")}>
            {/* Для не-multi мы уверены, что value это строка (или undefined) */}
            {options.find((o) => o.value === (value as string))?.label ||
              placeholder}
          </span>
        )}
      </div>
      <DropdownArrowIcon
        className={cn(
          "text-muted transition-transform duration-300 size-5",
          isActive && "rotate-180",
        )}
      />
    </div>
  );
};
