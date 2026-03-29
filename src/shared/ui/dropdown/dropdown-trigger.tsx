import { FC } from 'react';
import { cn } from '@/shared/lib/utils';
import { DropdownArrowIcon, DropdownRemoveIcon } from '@/shared/assets';
import { Option } from './types';

type TriggerProps = {
  isActive: boolean;
  isMulti: boolean;
  value?: string | string[];
  options: Option[];
  placeholder: string;
  onToggle: () => void;
  onRemove: (val: string) => void;
};

export const DropdownTrigger: FC<TriggerProps> = ({
  isActive,
  isMulti,
  value,
  options,
  placeholder,
  onToggle,
  onRemove,
}) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'flex items-center justify-between min-h-10.5 px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 bg-white select-none',
        'border-[#E3E4E5]',
        isActive
          ? 'border-[#F5653E] shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]'
          : 'hover:border-[#F5653E]/50',
      )}
    >
      <div className='flex flex-wrap gap-1.5 flex-1 overflow-hidden'>
        {isMulti && Array.isArray(value) && value.length > 0 ? (
          value.map((val) => (
            <div
              key={val}
              className='flex items-center gap-1 px-2 py-0.5 border border-[#E3E4E5] rounded-md bg-white text-sm'
            >
              {options.find((o) => o.value === val)?.label}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(val);
                }}
                className='hover:text-[#F5653E] transition-colors'
              >
                <DropdownRemoveIcon className='size-3.5' />
              </button>
            </div>
          ))
        ) : (
          <span className={cn(value ? 'text-[#191A1B]' : 'text-[#838A8D]')}>
            {/* Для не-multi мы уверены, что value это строка (или undefined) */}
            {options.find((o) => o.value === (value as string))?.label ||
              placeholder}
          </span>
        )}
      </div>
      <DropdownArrowIcon
        className={cn(
          'text-[#838A8D] transition-transform duration-300 size-5',
          isActive && 'rotate-180',
        )}
      />
    </div>
  );
};
