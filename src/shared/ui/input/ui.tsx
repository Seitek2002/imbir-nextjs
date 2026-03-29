import { WarningIcon } from '@/shared/assets';
import { cn } from '@/shared/lib/utils';
import { ComponentType, FC, InputHTMLAttributes, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Sizes = 'small' | 'large';

type Props = {
  label?: string;
  className?: string;
  IconLeft?: IconType;
  IconRight?: IconType;
  size?: Sizes;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FC<Props> = ({
  label,
  className,
  error,
  IconLeft,
  IconRight,
  size = 'small' as Sizes,
  ...props
}) => {
  const sizes: Record<Sizes, string> = {
    small: 'py-2.25',
    large: 'py-3.5',
  };

  const baseStyle =
    'text-base leading-0 border border-[#E3E4E5] text-[#191A1B] rounded-lg py-2.25 px-3 outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]' +
    sizes[size];

  return (
    <label htmlFor={props.id}>
      <span className='text-[#0D0D12] text-sm font-medium'>{label}</span>
      <div className='relative max-w-max'>
        {IconLeft && <IconLeft className='absolute left-3 top-2.25' />}
        <input
          id={props.id}
          type='text'
          placeholder={props.placeholder}
          className={cn(baseStyle, className)}
          {...props}
        />
        {IconRight && <IconRight className='absolute right-3 top-2.25' />}
      </div>
      {error && (
        <span className='flex items-center gap-1 text-sm text-[#838A8D]'>
          <WarningIcon className='size-5' />
          {error}
        </span>
      )}
    </label>
  );
};
