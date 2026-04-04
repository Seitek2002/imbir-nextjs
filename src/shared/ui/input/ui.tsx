import { ComponentType, FC, InputHTMLAttributes, SVGProps } from "react";

import { WarningIcon } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Sizes = "small" | "large";

type Props = {
  label?: string;
  className?: string;
  labelClassName?: string;
  IconLeft?: IconType;
  IconRight?: IconType;
  size?: Sizes;
  error?: string;
  hint?: string;
  onIconRightClick?: () => void;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FC<Props> = ({
  label,
  className,
  labelClassName,
  error,
  IconLeft,
  IconRight,
  size = "small" as Sizes,
  hint,
  onIconRightClick,
  ...props
}) => {
  const sizes: Record<Sizes, string> = {
    small: "py-2.25",
    large: "py-3.5",
  };

  const baseStyle =
    "text-base leading-0 border border-[#E3E4E5] text-[#191A1B] rounded-lg py-2.25 px-3 outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] disabled:bg-[#F2F3F5] " +
    sizes[size];

  const isIconLeft = IconLeft && "pl-10";

  const isError =
    error && "shadow-[0_0_1px_3px_rgba(223,28,65,0.3)] border-[#EC778D]";

  return (
    <label htmlFor={props.id} className={cn("block", labelClassName)}>
      <span className="text-[#0D0D12] text-sm font-medium">{label}</span>
      <div className="relative w-full">
        {IconLeft && <IconLeft className="absolute left-3 top-2.25 size-5" />}

        <input
          id={props.id}
          type={props.type && "text"}
          placeholder={props.placeholder}
          className={cn(baseStyle, isIconLeft, isError, className)}
          disabled={props.disabled}
          {...props}
        />

        {IconRight && (
          <IconRight
            className="absolute right-3 top-2.5 size-5"
            onClick={onIconRightClick}
          />
        )}
      </div>

      {error && (
        <span className="flex items-center gap-1 text-sm mt-1.5">
          <WarningIcon className="size-4" />
          <span className="text-[#DF1C41]">{error}</span>
        </span>
      )}

      {hint && <span className="text-sm text-[#838A8D] mt-1.5">{hint}</span>}
    </label>
  );
};
