import { FC } from 'react';
import { cn } from '@/shared/lib/utils';
import { Checkbox, Radio } from '@/shared';
import { DropdownCheckIcon } from '@/shared/assets';
import { Option, DropdownType } from './types';

type OptionProps = {
  option: Option;
  type: DropdownType;
  isSelected: boolean;
  onClick: () => void;
};

export const DropdownOption: FC<OptionProps> = ({
  option,
  type,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 md:px-3 md:py-2.5 flex items-center justify-between cursor-pointer transition-colors',
        'border-b border-[#E3E4E5] last:border-b-0 md:border-none',
        isSelected && type === 'default'
          ? 'md:bg-[#F2F3F5]'
          : 'md:hover:bg-[#F2F3F5]',
      )}
    >
      <span className='text-[#191A1B] text-base md:text-sm flex-1'>
        {option.label}
      </span>

      {type === 'checkbox' && (
        <div className='pointer-events-none'>
          <Checkbox checked={isSelected} readOnly />
        </div>
      )}

      {type === 'radio' && (
        <div className='pointer-events-none'>
          <Radio checked={isSelected} readOnly />
        </div>
      )}

      {type === 'default' && isSelected && (
        <DropdownCheckIcon className='size-5 md:size-3.5 text-[#F5653E] md:text-[#191A1B] animate-in zoom-in duration-200' />
      )}
    </div>
  );
};
