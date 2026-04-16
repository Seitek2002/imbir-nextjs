import { FC, TextareaHTMLAttributes } from "react";

import { WarningIcon } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";

type Props = {
  label?: string;
  labelClassName?: string;
  className?: string;
  error?: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: FC<Props> = ({
  id,
  label,
  className,
  labelClassName,
  error,
  hint,
  rows = 4,
  ...props
}) => {
  const baseStyle =
    "text-base border border-[#E3E4E5] text-[#191A1B] rounded-lg py-2.5 px-3 outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] disabled:bg-[#F2F3F5] w-full resize-none";

  const isError =
    error &&
    "shadow-[0_0_1px_3px_rgba(223,28,65,0.3)] border-[#EC778D] focus:shadow-[0_0_1px_3px_rgba(223,28,65,0.3)]";

  return (
    <label htmlFor={id} className={cn("flex flex-col gap-1.5", labelClassName)}>
      {label && (
        <span className="text-[#0D0D12] text-sm font-medium">{label}</span>
      )}

      <textarea
        id={id}
        rows={rows}
        className={cn(baseStyle, isError, className)}
        {...props}
      />

      {error && (
        <span className="flex items-center gap-1 text-sm mt-0.5">
          <WarningIcon className="size-4 shrink-0-0" />
          <span className="text-[#DF1C41]">{error}</span>
        </span>
      )}

      {hint && <span className="text-sm text-[#838A8D] mt-0.5">{hint}</span>}
    </label>
  );
};
