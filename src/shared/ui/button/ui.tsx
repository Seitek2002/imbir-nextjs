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
    xs: "text-xs py-1.5",
    sm: "text-sm py-2.5",
    md: "text-base py-3.5",
    lg: "text-base py-4",
  };

  const baseStyles =
    "px-4 font-medium flex items-center gap-2 cursor-pointer transition-all rounded-full outline-none disabled:opacity-50 disabled:pointer-events-none " +
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
