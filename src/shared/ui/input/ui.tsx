import { ComponentType, FC, InputHTMLAttributes, SVGProps } from "react";

import { WarningIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Sizes = "large" | "small";

type Props = {
  className?: string;
  error?: string;
  hint?: string;
  iconClassName?: string;
  IconLeft?: IconType;
  IconRight?: IconType;
  // Подпись для скринридера у кликабельной IconRight (например «Показать
  // пароль»). Имеет смысл только вместе с onIconRightClick.
  iconRightLabel?: string;
  label?: string;
  labelClassName?: string;
  onIconRightClick?: () => void;
  size?: Sizes;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FC<Props> = ({
  label,
  className,
  labelClassName,
  iconClassName,
  error,
  IconLeft,
  IconRight,
  size = "small" as Sizes,
  hint,
  onIconRightClick,
  iconRightLabel,
  type = "text",
  ...props
}) => {
  const sizes: Record<Sizes, string> = {
    small: "py-2.25",
    large: "py-3.5",
  };

  const baseStyle =
    "text-base leading-0 border border-border-soft text-foreground rounded-lg py-2.25 px-3 outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] disabled:bg-background w-full " +
    sizes[size];

  const isIconLeft = IconLeft && "pl-10";

  const isError =
    error &&
    "shadow-[0_0_1px_3px_rgba(223,28,65,0.3)] border-[#EC778D] focus:shadow-[0_0_1px_3px_rgba(223,28,65,0.3)]";

  return (
    <label
      htmlFor={props.id}
      className={cn("flex flex-col gap-1.5", labelClassName)}
    >
      {label && (
        <span className="text-overlay text-sm font-medium">{label}</span>
      )}

      <div className="relative w-full">
        {IconLeft && (
          <IconLeft
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground",
              iconClassName,
            )}
          />
        )}

        <input
          id={props.id}
          type={type}
          placeholder={props.placeholder}
          className={cn(baseStyle, isIconLeft, isError, className)}
          disabled={props.disabled}
          {...props}
        />

        {/* Кликабельная IconRight (глаз «показать пароль») — настоящая кнопка,
            а не SVG с onClick: иначе её невозможно нажать с клавиатуры и
            скринридер о ней не знает. type="button" обязателен — внутри формы
            голая <button> сабмитила бы её. Декоративная IconRight (почта,
            профиль) остаётся простым SVG и в таб-порядок не попадает. */}
        {IconRight &&
          (onIconRightClick ? (
            <button
              type="button"
              onClick={onIconRightClick}
              aria-label={iconRightLabel}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-md text-foreground cursor-pointer outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)]"
            >
              <IconRight className={cn("size-5", iconClassName)} />
            </button>
          ) : (
            <IconRight
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 size-5 text-foreground",
                iconClassName,
              )}
            />
          ))}
      </div>

      {error && (
        <span className="flex items-center gap-1 text-sm mt-0.5">
          <WarningIcon className="size-4 shrink-0" />
          <span className="text-[#DF1C41]">{error}</span>
        </span>
      )}

      {hint && <span className="text-sm text-muted mt-0.5">{hint}</span>}
    </label>
  );
};
