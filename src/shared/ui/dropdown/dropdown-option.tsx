import { FC } from "react";

import { DropdownCheckIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { Checkbox, Radio } from "@/shared/ui";

import { DropdownType, Option } from "./types";

type OptionProps = {
  isSelected: boolean;
  onClick: () => void;
  option: Option;
  type: DropdownType;
};

export const DropdownOption: FC<OptionProps> = ({
  option,
  type,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 md:px-3 md:py-2.5 flex items-center justify-between cursor-pointer transition-colors",
        "border-b border-border-soft last:border-b-0 md:border-none",
        isSelected && type === "default"
          ? "md:bg-background"
          : "md:hover:bg-background",
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
