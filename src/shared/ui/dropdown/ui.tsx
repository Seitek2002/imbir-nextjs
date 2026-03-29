'use client';

import { FC, useState, useRef, useMemo } from 'react';
import { useClickAway } from 'react-use';
import { cn } from '@/shared/lib/utils';
// Импорты остаются твоими, как ты и просил
import { Checkbox, Radio } from '@/shared';

type Option = {
  label: string;
  value: string;
};

type DropdownType = 'default' | 'checkbox' | 'radio';

type Props = {
  label?: string;
  placeholder?: string;
  hint?: string;
  options: Option[];
  type?: DropdownType;
  isMulti?: boolean;
  searchable?: boolean; // Новый пропс для поиска
  value?: any; // string | string[]
  onChange?: (value: any) => void;
  className?: string;
};

export const Dropdown: FC<Props> = ({
  label,
  placeholder = 'Выберите...',
  hint,
  options,
  type = 'default',
  isMulti = false,
  searchable = false, // По умолчанию поиск выключен
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Состояние для поиска
  const containerRef = useRef(null);

  useClickAway(containerRef, () => {
    setIsOpen(false);
    setSearchQuery('');
  });

  const handleSelect = (val: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(val)
        ? currentValues.filter((v) => v !== val)
        : [...currentValues, val];
      onChange?.(newValues);
    } else {
      onChange?.(val);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const isSelected = (val: string) => {
    if (Array.isArray(value)) return value.includes(val);
    return value === val;
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  return (
    <div
      className={cn('flex flex-col gap-1.5 w-full', className)}
      ref={containerRef}
    >
      {label && (
        <span className='text-[#0D0D12] text-sm font-medium'>{label}</span>
      )}

      <div className='relative'>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between min-h-10.5 px-3 py-2 border rounded-lg cursor-pointer transition-all bg-white select-none',
            'border-[#E3E4E5]',
            isOpen
              ? 'border-[#F5653E] shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]'
              : 'hover:border-[#F5653E]/50',
          )}
        >
          <div className='flex flex-wrap gap-1.5 flex-1 overflow-hidden'>
            {isMulti && Array.isArray(value) && value.length > 0 ? (
              value.map((val) => (
                <div
                  key={val}
                  className='flex items-center gap-1 px-2 py-0.5 border border-[#E3E4E5] rounded-md bg-white text-sm animate-in fade-in zoom-in duration-200'
                >
                  {options.find((o) => o.value === val)?.label}
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(val);
                    }}
                    className='hover:text-[#F5653E] transition-colors'
                  >
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 14 14'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                    >
                      <path
                        d='M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <span className={cn(value ? 'text-[#191A1B]' : 'text-[#838A8D]')}>
                {options.find((o) => o.value === value)?.label || placeholder}
              </span>
            )}
          </div>

          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            className={cn(
              'text-[#838A8D] transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          >
            <path
              d='M5 7.5L10 12.5L15 7.5'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>

        {/* Выпадающее меню */}
        {isOpen && (
          <div className='absolute z-50 w-full mt-1 bg-white border border-[#E3E4E5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col'>
            {/* Строка поиска */}
            {searchable && (
              <div className='p-2 sticky top-0 bg-white z-10 border-b border-[#E3E4E5]/50'>
                <input
                  type='text'
                  placeholder='Поиск...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  // Останавливаем всплытие клика, чтобы дропдаун не закрывался/мерцал
                  onClick={(e) => e.stopPropagation()}
                  className='w-full text-sm border border-[#E3E4E5] text-[#191A1B] rounded-md py-1.5 px-3 outline-none focus:border-[#F5653E] transition-colors'
                />
              </div>
            )}

            {/* Опция "Все" (рендерим только если ничего не ищем) */}
            {isMulti && !searchQuery && (
              <>
                <div
                  className='px-3 py-2.5 hover:bg-[#F2F3F5] cursor-pointer'
                  onClick={() => {
                    if (Array.isArray(value) && value.length === options.length)
                      onChange?.([]);
                    else onChange?.(options.map((o) => o.value));
                  }}
                >
                  {/* Отключаем события мыши на самом чекбоксе, чтобы ловил только родительский div */}
                  <div className='pointer-events-none'>
                    <Checkbox
                      label='Все'
                      checked={
                        Array.isArray(value) && value.length === options.length
                      }
                      readOnly
                    />
                  </div>
                </div>
                <div className='h-[1px] bg-[#F2F3F5] my-1 mx-3' />
              </>
            )}

            {/* Список опций */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors',
                    isSelected(opt.value) && type === 'default'
                      ? 'bg-[#F2F3F5]'
                      : 'hover:bg-[#F2F3F5]',
                  )}
                >
                  {type === 'checkbox' && (
                    <div className='pointer-events-none'>
                      <Checkbox
                        label={opt.label}
                        checked={isSelected(opt.value)}
                        readOnly
                      />
                    </div>
                  )}

                  {type === 'radio' && (
                    <div className='pointer-events-none'>
                      <Radio
                        label={opt.label}
                        checked={isSelected(opt.value)}
                        readOnly
                      />
                    </div>
                  )}

                  {type === 'default' && (
                    <>
                      <span className='text-sm text-[#191A1B]'>
                        {opt.label}
                      </span>
                      {isSelected(opt.value) && (
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 12 12'
                          fill='none'
                        >
                          <path
                            d='M10 3L4.5 8.5L2 6'
                            stroke='#191A1B'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className='px-3 py-4 text-center text-sm text-[#838A8D]'>
                Ничего не найдено
              </div>
            )}
          </div>
        )}
      </div>

      {hint && <span className='text-sm text-[#838A8D]'>{hint}</span>}
    </div>
  );
};
