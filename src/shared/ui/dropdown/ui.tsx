'use client';

import { FC, useState, useRef, useMemo, useEffect } from 'react';
import { useClickAway } from 'react-use';
import { cn } from '@/shared/lib/utils';
import { Checkbox } from '@/shared';

import { DropdownProps } from './types';
import { DropdownTrigger } from './dropdown-trigger';
import { DropdownMenu } from './dropdown-menu';
import { DropdownOption } from './dropdown-option';

export const Dropdown: FC<DropdownProps> = ({
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
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    setIsMounted(true);
    setTimeout(() => setIsActive(true), 10);
  };

  const closeDropdown = () => {
    setIsActive(false);
    setTimeout(() => {
      setIsMounted(false);
      setSearchQuery('');
    }, 300);
  };

  useClickAway(containerRef, () => {
    if (isMounted && isActive) closeDropdown();
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMounted && isMobile) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMounted]);

  const handleSelect = (val: string) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      onChange?.(
        current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val],
      );
    } else {
      onChange?.(val);
      if (window.innerWidth >= 768) closeDropdown();
    }
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
        <DropdownTrigger
          isActive={isActive}
          isMulti={isMulti}
          value={value}
          options={options}
          placeholder={placeholder}
          onToggle={() => (isActive ? closeDropdown() : openDropdown())}
          onRemove={handleSelect}
        />

        {isMounted && (
          <div
            className={cn(
              'fixed inset-0 z-40 bg-[#0D0D12]/40 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ease-out',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            onClick={closeDropdown}
          />
        )}

        {isMounted && (
          <DropdownMenu
            isActive={isActive}
            label={label}
            placeholder={placeholder}
            searchable={searchable}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClose={closeDropdown}
          >
            {isMulti && !searchQuery && (
              <>
                <div
                  className='p-4 md:px-3 md:py-2.5 flex items-center justify-between border-b border-[#E3E4E5] md:border-none md:hover:bg-[#F2F3F5] cursor-pointer transition-colors'
                  onClick={() =>
                    onChange?.(
                      Array.isArray(value) && value.length === options.length
                        ? []
                        : options.map((o) => o.value),
                    )
                  }
                >
                  <span className='text-[#191A1B] text-base md:text-sm flex-1'>
                    Все
                  </span>
                  <div className='pointer-events-none'>
                    <Checkbox
                      checked={
                        Array.isArray(value) && value.length === options.length
                      }
                      readOnly
                    />
                  </div>
                </div>
                <div className='hidden md:block h-px bg-[#F2F3F5] my-1 mx-3' />
              </>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <DropdownOption
                  key={opt.value}
                  option={opt}
                  type={type}
                  isSelected={
                    Array.isArray(value)
                      ? value.includes(opt.value)
                      : value === opt.value
                  }
                  onClick={() => handleSelect(opt.value)}
                />
              ))
            ) : (
              <div className='p-6 text-center text-sm text-[#838A8D]'>
                Ничего не найдено
              </div>
            )}
          </DropdownMenu>
        )}
      </div>

      {hint && <span className='text-sm text-[#838A8D] ml-1'>{hint}</span>}
    </div>
  );
};
