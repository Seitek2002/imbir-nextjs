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
  // Нативный дефолт <button> внутри <form> — type="submit". Кнопок в проекте
  // сотни, и большинство из них (Назад, Отмена, переключатели) сабмитить форму
  // не должны, а implicit submission по Enter выбирает ПЕРВУЮ submit-кнопку в
  // DOM. Поэтому дефолт здесь "button", а главная кнопка формы явно объявляет
  // type="submit".
  type = "button",
  ...props
}) => {
  // xs/sm — 32-40px высотой, меньше рекомендованного минимума в 44px для
  // тач-таргета (iOS HIG / Material). Расширяем кликабельную область только
  // по вертикали невидимым ::after — ширина (и весь остальной вид кнопки)
  // не меняется, так что соседние элементы в ряду не затрагиваются.
  const sizes: Record<Sizes, string> = {
    // Инсеты чуть больше, чем строго нужно по высоте: у outline-варианта есть
    // рамка (border), а её ширина вычитается из containing block для ::after
    // (это padding-box, не border-box) — с запасом это не играет роли.
    xs: "h-8 text-xs px-4 relative after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
    sm: "h-10 text-sm px-5 relative after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    md: "h-12 text-sm md:text-base px-6",
    lg: "h-[52px] text-base px-8",
  };

  // outline-none снимает системную обводку (она не вписывается в скруглённые
  // кнопки), поэтому фокус с клавиатуры рисуем сами тем же кольцом, что и у
  // полей ввода. focus-visible, а не focus: по клику мышью кольца быть не
  // должно — только при табе.
  const baseStyles =
    "font-medium flex items-center justify-center gap-2 cursor-pointer transition-all rounded-full outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)] disabled:opacity-50 disabled:pointer-events-none shrink-0 " +
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
      type={type}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
      disabled={props.disabled || loading}
    >
      {loading ? (
        <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        IconLeft && <IconLeft className="size-5" />
      )}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="size-5" />}
    </button>
  );
};
