import { DropdownArrowIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

export const SelectField = ({
  label,
  value,
  placeholder,
  disabled,
  onClick,
}: {
  label: string;
  value?: string;
  placeholder: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <div className="space-y-1.5">
    <span className="text-sm font-medium text-overlay">{label}</span>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full h-11 rounded-lg border border-border-soft px-3 text-left flex items-center justify-between transition-all",
        "focus-visible:outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]",
        !disabled && "hover:border-primary/40",
        disabled && "bg-[#F7F8F9] text-[#A6ACB0] cursor-not-allowed",
      )}
    >
      <span className={cn("text-sm", value ? "text-foreground" : "text-muted")}>
        {value || placeholder}
      </span>
      <DropdownArrowIcon className="size-5 text-muted" />
    </button>
  </div>
);
