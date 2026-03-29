'use client';

import { FC, useState, useRef, useMemo, useEffect } from 'react';
import { useClickAway } from 'react-use';
import { cn } from '@/shared/lib/utils';
import { Checkbox, Radio, Button } from '@/shared';
import {
  DropdownArrowIcon,
  DropdownCheckIcon,
  DropdownRemoveIcon,
} from '@/shared/assets';

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
  searchable?: boolean;
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
  searchable = false,
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ y: 0, time: 0 });

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  // Закрытие при клике вне компонента (работает на десктопе)
  useClickAway(containerRef, () => closeDropdown());

  // Блокировка скролла body при открытой шторке на мобильных
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(val)
        ? currentValues.filter((v) => v !== val)
        : [...currentValues, val];
      onChange?.(newValues);
    } else {
      onChange?.(val);
      if (window.innerWidth >= 768) closeDropdown();
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

  // --- ЛОГИКА СВАЙПА (60 FPS Performance) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, time: Date.now() };
    if (sheetRef.current) {
      // Отключаем анимацию во время перетаскивания, чтобы палец "прилипал" к шторке
      sheetRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = e.touches[0].clientY - touchStart.current.y;

    // Предотвращаем свайп шторки, если пользователь скроллит сам список (и список не в самом верху)
    if (scrollRef.current?.contains(e.target as Node)) {
      if (scrollRef.current.scrollTop > 0 || deltaY < 0) {
        return;
      }
    }

    // Тянем шторку только вниз
    if (deltaY > 0) {
      // Прямая мутация DOM (без перерендера React) для производительности
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const timeElapsed = Date.now() - touchStart.current.time;
    const velocity = deltaY / timeElapsed; // Скорость свайпа

    // Включаем красивую spring-анимацию для возврата/закрытия
    sheetRef.current.style.transition =
      'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';

    // Если свайпнули достаточно сильно (более 150px или быстро)
    if (deltaY > 150 || velocity > 0.5) {
      closeDropdown();
      // Сбрасываем стили после закрытия
      setTimeout(() => {
        if (sheetRef.current) sheetRef.current.style.transform = '';
      }, 300);
    } else {
      // Возвращаем на место (недостаточный свайп)
      sheetRef.current.style.transform = 'translateY(0px)';
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-1.5 w-full', className)}
      ref={containerRef}
    >
      {label && (
        <span className='text-[#0D0D12] text-sm font-medium'>{label}</span>
      )}

      <div className='relative'>
        {/* Trigger (Поле выбора) */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between min-h-10.5 px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 bg-white select-none',
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
                  className='flex items-center gap-1 px-2 py-0.5 border border-[#E3E4E5] rounded-md bg-white text-sm animate-in fade-in zoom-in-95 duration-200'
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
                    <DropdownRemoveIcon className='size-3.5' />
                  </button>
                </div>
              ))
            ) : (
              <span
                className={cn(
                  value ? 'text-[#191A1B]' : 'text-[#838A8D]',
                  'animate-in fade-in duration-200',
                )}
              >
                {options.find((o) => o.value === value)?.label || placeholder}
              </span>
            )}
          </div>

          <DropdownArrowIcon
            className={cn(
              'text-[#838A8D] transition-transform duration-300 size-5',
              isOpen && 'rotate-180',
            )}
          />
        </div>

        {/* Темный фон для мобильной шторки (Добавлен blur) */}
        {isOpen && (
          <div
            className='fixed inset-0 z-40 bg-[#0D0D12]/40 backdrop-blur-[2px] md:hidden animate-in fade-in duration-300'
            onClick={closeDropdown}
          />
        )}

        {/* Выпадающее меню / Bottom Sheet */}
        {isOpen && (
          <div
            ref={sheetRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={cn(
              // --- MOBILE BASE ---
              'fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl p-4 pb-safe',
              'animate-in slide-in-from-bottom-full duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              // --- DESKTOP OVERRIDES ---
              'md:absolute md:inset-auto md:top-full md:mt-1 md:w-full md:p-1 md:rounded-xl md:border md:border-[#E3E4E5] md:shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
              'md:slide-in-from-top-2 md:zoom-in-95 md:duration-200 md:ease-out',
            )}
          >
            {/* Индикатор свайпа (Pill) */}
            <div className='w-10 h-1.5 bg-[#E3E4E5] rounded-full mx-auto mb-3 md:hidden' />

            {/* Хедер (Заголовок и крестик) */}
            <div className='flex items-center justify-between mb-4 md:hidden'>
              <div className='size-8' />
              <span className='text-lg font-semibold text-[#0D0D12]'>
                {label || placeholder}
              </span>
              <button
                onClick={closeDropdown}
                className='flex items-center justify-center size-8 border border-[#E3E4E5] bg-[#F2F3F5]/50 rounded-full text-[#191A1B] active:bg-[#E3E4E5] transition-colors'
              >
                <DropdownRemoveIcon className='size-3.5' />
              </button>
            </div>

            {/* Строка поиска */}
            {searchable && (
              <div className='mb-4 md:mb-0 md:p-2 sticky top-0 bg-white z-10 md:border-b md:border-[#E3E4E5]/50'>
                <input
                  type='text'
                  placeholder='Поиск...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className='w-full text-base md:text-sm border border-[#E3E4E5] text-[#191A1B] rounded-xl md:rounded-md py-2.5 md:py-1.5 px-3 outline-none focus:border-[#F5653E] focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.1)] transition-all'
                />
              </div>
            )}

            {/* Контейнер списка со скроллом */}
            <div
              ref={scrollRef}
              className='flex-1 overflow-y-auto max-h-[55vh] md:max-h-64 border border-[#E3E4E5] rounded-xl md:border-none md:rounded-none'
            >
              {/* Опция "Все" */}
              {isMulti && !searchQuery && (
                <>
                  <div
                    className='p-4 md:px-3 md:py-2.5 flex items-center justify-between border-b border-[#E3E4E5] md:border-none md:hover:bg-[#F2F3F5] cursor-pointer transition-colors'
                    onClick={() => {
                      if (
                        Array.isArray(value) &&
                        value.length === options.length
                      )
                        onChange?.([]);
                      else onChange?.(options.map((o) => o.value));
                    }}
                  >
                    <span className='text-[#191A1B] text-base md:text-sm flex-1'>
                      Все
                    </span>
                    <div className='pointer-events-none'>
                      <Checkbox
                        checked={
                          Array.isArray(value) &&
                          value.length === options.length
                        }
                        readOnly
                      />
                    </div>
                  </div>
                  <div className='hidden md:block h-px bg-[#F2F3F5] my-1 mx-3' />
                </>
              )}

              {/* Список опций */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'p-4 md:px-3 md:py-2.5 flex items-center justify-between cursor-pointer transition-colors',
                      'border-b border-[#E3E4E5] last:border-b-0 md:border-none',
                      isSelected(opt.value) && type === 'default'
                        ? 'md:bg-[#F2F3F5]'
                        : 'md:hover:bg-[#F2F3F5]',
                    )}
                  >
                    <span className='text-[#191A1B] text-base md:text-sm flex-1'>
                      {opt.label}
                    </span>

                    {type === 'checkbox' && (
                      <div className='pointer-events-none'>
                        <Checkbox checked={isSelected(opt.value)} readOnly />
                      </div>
                    )}

                    {type === 'radio' && (
                      <div className='pointer-events-none'>
                        <Radio checked={isSelected(opt.value)} readOnly />
                      </div>
                    )}

                    {type === 'default' && isSelected(opt.value) && (
                      <DropdownCheckIcon className='size-5 md:size-3.5 text-[#F5653E] md:text-[#191A1B] animate-in zoom-in duration-200' />
                    )}
                  </div>
                ))
              ) : (
                <div className='p-6 text-center text-sm text-[#838A8D]'>
                  Ничего не найдено
                </div>
              )}
            </div>

            {/* Кнопка "Готово" только для мобилок */}
            <div className='mt-5 md:hidden'>
              <Button
                className='w-full py-3.5 text-base justify-center'
                onClick={closeDropdown}
              >
                Готово
              </Button>
            </div>
          </div>
        )}
      </div>

      {hint && <span className='text-sm text-[#838A8D] ml-1'>{hint}</span>}
    </div>
  );
};
