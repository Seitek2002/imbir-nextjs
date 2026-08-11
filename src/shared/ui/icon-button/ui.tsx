"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/shared/lib/utils";

type Variant = "default" | "outline" | "text";
type Sizes = "xs" | "sm" | "md" | "lg";

type Props = {
  loading?: boolean;
  variant?: Variant;
  size?: Sizes;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconBtn = forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      className,
      loading,
      variant = "default",
      size = "xs",
      // См. комментарий про type в shared/ui/button/ui.tsx — иконочные кнопки
      // (назад, закрыть, показать пароль) внутри формы тем более не должны
      // сабмитить её по умолчанию.
      type = "button",
      ...props
    },
    ref,
  ) => {
    // xs/sm — иконка + паддинг дают всего ~28-40px видимого размера, меньше
    // рекомендованного минимума в 44px для тач-таргета (iOS HIG / Material).
    // Визуально кнопку не увеличиваем — вместо этого невидимый ::after
    // расширяет именно кликабельную область до 44×44, отцентрованно.
    const hitArea =
      "after:absolute after:inset-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";
    const sizes: Record<Sizes, string> = {
      xs: `p-1.5 ${hitArea}`,
      sm: `p-2.5 ${hitArea}`,
      md: "p-3.5",
      lg: "p-4",
    };

    const baseStyles =
      "relative inline-flex items-center justify-center cursor-pointer transition-all rounded-full outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)] disabled:opacity-50 disabled:pointer-events-none " +
      sizes[size];

    const variants: Record<Variant, string> = {
      default:
        "bg-primary active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]",
      outline:
        "border border-border active:bg-border-soft hover:shadow-[0_0_1px_3px_rgba(242,243,245,0.8),0_0_0_1px_#E5E6E8] hover:bg-transparent",
      text: "active:bg-border-soft hover:bg-background",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
        disabled={props.disabled || loading}
      >
        {children}
      </button>
    );
  },
);

IconBtn.displayName = "IconBtn";
