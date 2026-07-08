import { ButtonHTMLAttributes, ComponentType, FC, SVGProps } from "react";

import { cn } from "@/shared/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Variant = "default" | "outline" | "text";
type Sizes = "xs" | "sm" | "md" | "lg";

type Props = {
  loading?: boolean;
  variant?: Variant;
  IconLeft?: IconType;
  IconRight?: IconType;
  size?: Sizes;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<Props> = ({
  children,
  className,
  loading,
  IconRight,
  IconLeft,
  variant = "default",
  size = "xs",
  ...props
}) => {
  const sizes: Record<Sizes, string> = {
    xs: "h-8 text-xs px-4",
    sm: "h-10 text-sm px-5",
    md: "h-12 text-sm md:text-base px-6",
    lg: "h-[52px] text-base px-8",
  };

  const baseStyles =
    "font-medium flex items-center justify-center gap-2 cursor-pointer transition-all rounded-full outline-none disabled:opacity-50 disabled:pointer-events-none shrink-0 " +
    sizes[size];

  const variants: Record<Variant, string> = {
    default:
      "bg-primary text-white active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]",
    outline:
      "border border-border active:bg-border-soft hover:shadow-[0_0_1px_3px_rgba(242,243,245,0.8),0_0_0_1px_#E5E6E8] hover:bg-transparent",
    text: "text-foreground active:bg-border-soft hover:bg-background",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
      disabled={props.disabled || loading}
    >
      {IconLeft && <IconLeft className="size-5" />}
      <span>{children}</span>
      {IconRight && <IconRight className="size-5" />}
    </button>
  );
};
