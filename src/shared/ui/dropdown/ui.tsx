"use client";

import {
  FC,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useClickAway } from "react-use";

import { useIsMobile } from "@/shared/lib/useIsMobile";
import { cn } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui";

import { DropdownMenu } from "./dropdown-menu";
import { DropdownOption } from "./dropdown-option";
import { DropdownTrigger } from "./dropdown-trigger";
import { DropdownProps } from "./types";

export const Dropdown: FC<DropdownProps> = ({
  label,
  placeholder = "Выберите...",
  hint,
  options,
  type = "default",
  isMulti = false,
  searchable = false,
  showSelectAll = false,
  selectAllMode = "clear",
  value,
  onChange,
  className,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Пункт под стрелками. -1 — ничего не подсвечено (список только открыли).
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  // Отдельный ref на шторку: в портале она не потомок containerRef, и без
  // него клик по пункту считался бы кликом «мимо».
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const optionId = (index: number) => `${uid}-opt-${index}`;

  const openDropdown = () => {
    setIsMounted(true);
    setTimeout(() => setIsActive(true), 10);
  };

  const closeDropdown = () => {
    setIsActive(false);
    setHighlighted(-1);
    setTimeout(() => {
      setIsMounted(false);
      setSearchQuery("");
    }, 300);
  };

  useClickAway(containerRef, (event) => {
    if (menuRef.current?.contains(event.target as Node)) return;
    if (isMounted && isActive) closeDropdown();
  });

  useEffect(() => {
    if (isMounted && isMobile) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMounted, isMobile]);

  const handleSelect = (val: string) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const newValues = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];

      (onChange as (val: string[]) => void)?.(newValues);
    } else {
      (onChange as (val: string) => void)?.(val);

      if (!isMobile) closeDropdown();
    }
  };

  // Отмечены ли все пункты — нужно только режиму "select".
  const allOptionsSelected =
    options.length > 0 &&
    Array.isArray(value) &&
    value.length === options.length;

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  const handleSelectAll = () => {
    (onChange as (val: string[]) => void)?.(
      selectAllMode === "select"
        ? // Форма: «Все» — это реально выбранные пункты, потому что их
          // надо сохранить. Повторный клик работает как «снять всё».
          allOptionsSelected
          ? []
          : options.map((opt) => opt.value)
        : // Фильтр: «Все» означает отсутствие фильтра, а не выбор каждой
          // специализации: так не отправляем огромный список в API.
          [],
    );
  };

  const hasSelectAllRow = isMulti && showSelectAll && !searchQuery;

  // Стрелки ходят по строке «Все» и пунктам как по одному списку, иначе
  // «Все» осталась бы доступна только мышью.
  const navCount = filteredOptions.length + (hasSelectAllRow ? 1 : 0);
  const optionIndexOffset = hasSelectAllRow ? 1 : 0;

  const activate = (index: number) => {
    if (hasSelectAllRow && index === 0) return handleSelectAll();
    const opt = filteredOptions[index - optionIndexOffset];
    if (opt) handleSelect(opt.value);
  };

  const move = (delta: number) => {
    if (navCount === 0) return;
    setHighlighted((prev) => {
      // -1 + 1 даёт 0, а шаг вверх из «ничего» встаёт на последний пункт.
      if (prev === -1) return delta > 0 ? 0 : navCount - 1;
      return (prev + delta + navCount) % navCount;
    });
  };

  // Сбрасываем подсветку прямо в обработчике, а не эффектом на searchQuery:
  // список фильтруется на лету, и старый индекс указал бы на другой пункт.
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    // Пробел печатается в поиске, поэтому перехватываем его только когда
    // фокус на самом триггере.
    const isTyping = e.target instanceof HTMLInputElement;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isActive) openDropdown();
        else move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isActive) openDropdown();
        else move(-1);
        break;
      case "Home":
        if (isActive && !isTyping) {
          e.preventDefault();
          setHighlighted(0);
        }
        break;
      case "End":
        if (isActive && !isTyping) {
          e.preventDefault();
          setHighlighted(navCount - 1);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (!isActive) openDropdown();
        else if (highlighted >= 0) activate(highlighted);
        break;
      case " ":
        if (isTyping) break;
        e.preventDefault();
        if (!isActive) openDropdown();
        else if (highlighted >= 0) activate(highlighted);
        break;
      case "Escape":
        if (isActive) {
          e.preventDefault();
          closeDropdown();
          // Фокус ушёл бы на body, и Tab начал бы обход страницы заново.
          triggerRef.current?.focus();
        }
        break;
      case "Tab":
        if (isActive) closeDropdown();
        break;
    }
  };

  // Держим подсвеченный пункт в зоне видимости при ходьбе стрелками.
  useEffect(() => {
    if (highlighted < 0) return;
    containerRef.current
      ?.querySelector(`[data-dd-index="${highlighted}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  // Шторка уезжает в портал: внутри Modal у родителя есть transform и
  // overflow:hidden, из-за которых fixed-элемент позиционируется от модалки
  // и обрезается по ней — у списка городов пропадали шапка и первые пункты.
  // На десктопе меню остаётся на месте: оно absolute относительно триггера.
  const sheet = (
    <div ref={menuRef}>
      <div
        className={cn(
          // z выше модалки (z-100): шторка уходит в портал и становится
          // соседом модалки в body, а не её потомком — с z-40 она
          // отрисовывалась под ней.
          "fixed inset-0 z-110 bg-overlay/40 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ease-out",
          isActive ? "opacity-100" : "opacity-0",
        )}
        onClick={closeDropdown}
      />
      <DropdownMenu
        isActive={isActive}
        isMulti={isMulti}
        listboxId={listboxId}
        label={label}
        placeholder={placeholder}
        searchable={searchable}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClose={closeDropdown}
      >
        {hasSelectAllRow && (
          <>
            <div
              id={optionId(0)}
              role="option"
              aria-selected={
                selectAllMode === "select"
                  ? allOptionsSelected
                  : Array.isArray(value) && value.length === 0
              }
              data-dd-index={0}
              className={cn(
                "p-4 md:px-3 md:py-2.5 flex items-center justify-between border-b border-border-soft md:border-none cursor-pointer transition-colors",
                highlighted === 0
                  ? "md:bg-background"
                  : "md:hover:bg-background",
              )}
              onMouseMove={() => setHighlighted(0)}
              onClick={handleSelectAll}
            >
              <span className="text-foreground text-base md:text-sm flex-1">
                Все
              </span>
              <div className="pointer-events-none">
                <Checkbox
                  checked={
                    selectAllMode === "select"
                      ? allOptionsSelected
                      : Array.isArray(value) && value.length === 0
                  }
                  readOnly
                />
              </div>
            </div>
            <div className="hidden md:block h-px bg-background my-1 mx-3" />
          </>
        )}

        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt, i) => (
            <DropdownOption
              key={opt.value}
              id={optionId(i + optionIndexOffset)}
              index={i + optionIndexOffset}
              option={opt}
              type={type}
              isSelected={
                Array.isArray(value)
                  ? value.includes(opt.value)
                  : value === opt.value
              }
              isHighlighted={highlighted === i + optionIndexOffset}
              onHover={() => setHighlighted(i + optionIndexOffset)}
              onClick={() => handleSelect(opt.value)}
            />
          ))
        ) : (
          <div className="p-6 text-center text-sm text-muted">
            Ничего не найдено
          </div>
        )}
      </DropdownMenu>
    </div>
  );

  return (
    // Клавиши слушает контейнер, а не триггер: при открытом списке фокус
    // может стоять в поле поиска, и обработчик на триггере туда не достаёт.
    <div
      className={cn("flex flex-col gap-1.5 w-full", className)}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <span className="text-overlay text-sm font-medium">{label}</span>
      )}

      <div className="relative">
        <DropdownTrigger
          ref={triggerRef}
          isActive={isActive}
          isMulti={isMulti}
          value={value}
          options={options}
          placeholder={placeholder}
          listboxId={listboxId}
          activeDescendant={
            highlighted >= 0 ? optionId(highlighted) : undefined
          }
          onToggle={() => (isActive ? closeDropdown() : openDropdown())}
          onRemove={handleSelect}
          onClearAll={() => (onChange as (val: string[]) => void)?.([])}
        />

        {isMounted && (isMobile ? createPortal(sheet, document.body) : sheet)}
      </div>

      {hint && <span className="text-sm text-muted ml-1">{hint}</span>}
    </div>
  );
};
