'use client';

import { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type Variant = 'default' | 'outline' | 'text';

type Props = {
  loading?: boolean;
  variant?: Variant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<Props> = ({
  children,
  className,
  loading,
  iconRight,
  iconLeft,
  variant = 'default',
  ...props
}) => {
  const baseStyles =
    'py-1.5 px-4 flex gap-2 cursor-pointer transition-all rounded-full outline-none disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<Variant, string> = {
    default:
      'bg-[#F5653E] text-white active:bg-[#C54826] hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]',
    outline:
      'border border-[#E5E6E8] active:bg-[#E3E4E5] hover:shadow-[0_0_1px_3px_rgba(242,243,245,0.8),0_0_0_1px_#E5E6E8] hover:bg-transparent',
    text: 'text-[#191A1B] active:bg-[#E3E4E5] hover:bg-[#F2F3F5]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
      disabled={props.disabled || loading}
    >
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
};
