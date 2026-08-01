import { FC, ReactNode } from "react";

import { DropdownRemoveIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

import { useDropdownSwipe } from "./use-dropdown-swipe";

type MenuProps = {
  isActive: boolean;
  label?: string;
  placeholder: string;
  searchable: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClose: () => void;
  children: ReactNode;
};

export const DropdownMenu: FC<MenuProps> = ({
  isActive,
  label,
  placeholder,
  searchable,
  searchQuery,
  onSearchChange,
  onClose,
  children,
}) => {
  const { sheetRef, scrollRef, handlers } = useDropdownSwipe(onClose);

  return (
    <div
      ref={sheetRef}
      {...handlers}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl p-4 pb-safe",
        "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "md:absolute md:inset-auto md:top-full md:mt-1 md:w-full md:p-1 md:rounded-xl md:border md:border-border-soft md:shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:ease-out",
        isActive
          ? "translate-y-0 md:opacity-100 md:scale-100"
          : "translate-y-full md:-translate-y-2 md:opacity-0 md:scale-95",
      )}
    >
      <div className="w-10 h-1.5 bg-border-soft rounded-full mx-auto mb-3 md:hidden" />

      <div className="flex items-center justify-between mb-4 md:hidden">
        <div className="size-8" />
        <span className="text-lg font-semibold text-overlay">
          {label || placeholder}
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center size-8 border border-border-soft bg-background/50 rounded-full text-foreground active:bg-border-soft transition-colors"
        >
          <DropdownRemoveIcon className="size-3.5" />
        </button>
      </div>

      {searchable && (
        <div className="mb-4 md:mb-0 md:p-2 sticky top-0 bg-white z-10 md:border-b md:border-border-soft/50">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-base md:text-sm border border-border-soft text-foreground rounded-xl md:rounded-md py-2.5 md:py-1.5 px-3 outline-none focus:border-primary focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.1)] transition-all"
          />
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto max-h-[55vh] md:max-h-64 border border-border-soft rounded-xl md:border-none md:rounded-none"
      >
        {children}
      </div>

      <div className="mt-5 md:hidden">
        <Button
          className="w-full py-3.5 text-base justify-center"
          onClick={onClose}
        >
          Готово
        </Button>
      </div>
    </div>
  );
};
