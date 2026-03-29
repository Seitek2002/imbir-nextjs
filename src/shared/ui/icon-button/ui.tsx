'use client';

import { ButtonHTMLAttributes, FC } from 'react';
import { cn } from '@/shared/lib/utils';

type Variant = 'default' | 'outline' | 'text';
type Sizes = 'xs' | 'sm' | 'md' | 'lg';

type Props = {
  loading?: boolean;
  variant?: Variant;
  size?: Sizes;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconBtn: FC<Props> = ({
  children,
  className,
  loading,
  variant = 'default',
  size = 'xs',
  ...props
}) => {
  const sizes: Record<Sizes, string> = {
    xs: 'p-1.5',
    sm: 'p-2.5',
    md: 'p-3.5',
    lg: 'p-4',
  };

  const baseStyles =
    'cursor-pointer transition-all rounded-full outline-none disabled:opacity-50 disabled:pointer-events-none ' +
    sizes[size];

  const variants: Record<Variant, string> = {
    default:
      'bg-[#F5653E] active:bg-[#C54826] hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]',
    outline:
      'border border-[#E5E6E8] active:bg-[#E3E4E5] hover:shadow-[0_0_1px_3px_rgba(242,243,245,0.8),0_0_0_1px_#E5E6E8] hover:bg-transparent',
    text: 'active:bg-[#E3E4E5] hover:bg-[#F2F3F5]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
      disabled={props.disabled || loading}
    >
      {children}
    </button>
  );
};
