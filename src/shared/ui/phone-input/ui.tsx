"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useClickAway } from "react-use";

import {
  DropdownArrowIcon,
  DropdownRemoveIcon,
  WarningIcon,
} from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

import { Button } from "../button";
import { useDropdownSwipe } from "../dropdown/use-dropdown-swipe";

export type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  phoneLength: number;
};

export const COUNTRIES: Country[] = [
  {
    code: "AZ",
    name: "Азербайджан",
    dialCode: "+994",
    flag: "🇦🇿",
    phoneLength: 9,
  },
  { code: "AM", name: "Армения", dialCode: "+374", flag: "🇦🇲", phoneLength: 8 },
  {
    code: "BY",
    name: "Беларусь",
    dialCode: "+375",
    flag: "🇧🇾",
    phoneLength: 9,
  },
  {
    code: "GB",
    name: "Великобритания",
    dialCode: "+44",
    flag: "🇬🇧",
    phoneLength: 10,
  },
  {
    code: "DE",
    name: "Германия",
    dialCode: "+49",
    flag: "🇩🇪",
    phoneLength: 11,
  },
  { code: "GE", name: "Грузия", dialCode: "+995", flag: "🇬🇪", phoneLength: 9 },
  { code: "IN", name: "Индия", dialCode: "+91", flag: "🇮🇳", phoneLength: 10 },
  {
    code: "KZ",
    name: "Казахстан",
    dialCode: "+7",
    flag: "🇰🇿",
    phoneLength: 10,
  },
  { code: "CN", name: "Китай", dialCode: "+86", flag: "🇨🇳", phoneLength: 11 },
  {
    code: "KG",
    name: "Кыргызстан",
    dialCode: "+996",
    flag: "🇰🇬",
    phoneLength: 9,
  },
  { code: "MD", name: "Молдова", dialCode: "+373", flag: "🇲🇩", phoneLength: 8 },
  { code: "AE", name: "ОАЭ", dialCode: "+971", flag: "🇦🇪", phoneLength: 9 },
  { code: "RU", name: "Россия", dialCode: "+7", flag: "🇷🇺", phoneLength: 10 },
  {
    code: "SA",
    name: "Саудовская Аравия",
    dialCode: "+966",
    flag: "🇸🇦",
    phoneLength: 9,
  },
  { code: "US", name: "США", dialCode: "+1", flag: "🇺🇸", phoneLength: 10 },
  {
    code: "TJ",
    name: "Таджикистан",
    dialCode: "+992",
    flag: "🇹🇯",
    phoneLength: 9,
  },
  {
    code: "TM",
    name: "Туркменистан",
    dialCode: "+993",
    flag: "🇹🇲",
    phoneLength: 8,
  },
  { code: "TR", name: "Турция", dialCode: "+90", flag: "🇹🇷", phoneLength: 10 },
  {
    code: "UZ",
    name: "Узбекистан",
    dialCode: "+998",
    flag: "🇺🇿",
    phoneLength: 9,
  },
  { code: "UA", name: "Украина", dialCode: "+380", flag: "🇺🇦", phoneLength: 9 },
  { code: "FR", name: "Франция", dialCode: "+33", flag: "🇫🇷", phoneLength: 9 },
  {
    code: "KR",
    name: "Южная Корея",
    dialCode: "+82",
    flag: "🇰🇷",
    phoneLength: 10,
  },
  { code: "JP", name: "Япония", dialCode: "+81", flag: "🇯🇵", phoneLength: 10 },
];

type Props = {
  label?: string;
  value?: string;
  defaultCountryCode?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: Country) => void;
  error?: string;
  hint?: string;
  className?: string;
};

export const PhoneInput: FC<Props> = ({
  label,
  value = "",
  defaultCountryCode = "KG",
  onChange,
  onCountryChange,
  error,
  hint,
  className,
}) => {
  const defaultCountry =
    COUNTRIES.find((c) => c.code === defaultCountryCode) ??
    COUNTRIES.find((c) => c.code === "KG")!;

  const [selectedCountry, setSelectedCountry] =
    useState<Country>(defaultCountry);
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    setIsMounted(true);
    setTimeout(() => setIsActive(true), 10);
  };

  const closeDropdown = () => {
    setIsActive(false);
    setTimeout(() => {
      setIsMounted(false);
      setSearchQuery("");
    }, 300);
  };

  useClickAway(containerRef, () => {
    if (isMounted && isActive) closeDropdown();
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMounted && isMobile) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMounted]);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
    if (value.length > country.phoneLength) {
      onChange?.(value.slice(0, country.phoneLength));
    }
    if (window.innerWidth >= 768) closeDropdown();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.startsWith("0")) return;
    if (raw.length > selectedCountry.phoneLength) return;
    onChange?.(raw);
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    const q = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const { sheetRef, scrollRef, handlers } = useDropdownSwipe(closeDropdown);

  const hasError = !!error;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <span className="text-overlay text-sm font-medium">{label}</span>
      )}

      <div className="relative">
        <div
          className={cn(
            "flex items-center border rounded-lg bg-white transition-all duration-200",
            hasError
              ? "border-[#EC778D] shadow-[0_0_1px_3px_rgba(223,28,65,0.3)]"
              : isActive
                ? "border-primary shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]"
                : "border-border-soft focus-within:border-primary focus-within:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]",
          )}
        >
          <button
            type="button"
            onClick={() => (isActive ? closeDropdown() : openDropdown())}
            className="flex items-center gap-1.5 pl-3 pr-2 py-[9px] shrink-0 select-none"
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-foreground tabular-nums">
              {selectedCountry.dialCode}
            </span>
            <DropdownArrowIcon
              className={cn(
                "size-4 text-muted transition-transform duration-300 shrink-0",
                isActive && "rotate-180",
              )}
            />
          </button>

          <div className="w-px h-5 bg-border-soft shrink-0" />

          <input
            type="tel"
            inputMode="numeric"
            placeholder={"•".repeat(selectedCountry.phoneLength)}
            value={value}
            onChange={handlePhoneChange}
            maxLength={selectedCountry.phoneLength}
            className="flex-1 px-3 py-[9px] text-base text-foreground outline-none bg-transparent placeholder:text-[#C5C8CA] rounded-r-lg min-w-0"
          />
        </div>

        {isMounted && (
          <div
            className={cn(
              "fixed inset-0 z-40 bg-overlay/40 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ease-out",
              isActive ? "opacity-100" : "opacity-0",
            )}
            onClick={closeDropdown}
          />
        )}

        {isMounted && (
          <div
            ref={sheetRef}
            {...handlers}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl p-4 pb-safe",
              "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "md:absolute md:inset-auto md:top-full md:mt-1 md:w-72 md:p-1 md:rounded-xl md:border md:border-border-soft md:shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:ease-out",
              isActive
                ? "translate-y-0 md:opacity-100 md:scale-100"
                : "translate-y-full md:-translate-y-2 md:opacity-0 md:scale-95",
            )}
          >
            <div className="w-10 h-1.5 bg-border-soft rounded-full mx-auto mb-3 md:hidden" />

            <div className="flex items-center justify-between mb-4 md:hidden">
              <div className="size-8" />
              <span className="text-lg font-semibold text-overlay">
                Код страны
              </span>
              <button
                type="button"
                onClick={closeDropdown}
                className="flex items-center justify-center size-8 border border-border-soft bg-background/50 rounded-full text-foreground active:bg-border-soft transition-colors"
              >
                <DropdownRemoveIcon className="size-3.5" />
              </button>
            </div>

            <div className="mb-4 md:mb-0 md:p-2 sticky top-0 bg-white z-10 md:border-b md:border-border-soft/50">
              <input
                type="text"
                placeholder="Страна или код..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                // Поиск страны живёт внутри <form> страницы авторизации.
                // Без этого Enter здесь сабмитил бы всю форму регистрации
                // вместо выбора страны.
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  const [first] = filteredCountries;
                  if (first) handleSelectCountry(first);
                }}
                className="w-full text-base md:text-sm border border-border-soft text-foreground rounded-xl md:rounded-md py-2.5 md:py-1.5 px-3 outline-none focus:border-primary focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.1)] transition-all"
              />
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto max-h-[55vh] md:max-h-64 border border-border-soft rounded-xl md:border-none md:rounded-none"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    onClick={() => handleSelectCountry(country)}
                    className={cn(
                      "p-4 md:px-3 md:py-2.5 flex items-center gap-3 cursor-pointer transition-colors",
                      "border-b border-border-soft last:border-b-0 md:border-none md:rounded-lg",
                      selectedCountry.code === country.code
                        ? "md:bg-background"
                        : "md:hover:bg-background",
                    )}
                  >
                    <span className="text-xl leading-none">{country.flag}</span>
                    <span className="flex-1 text-foreground text-base md:text-sm">
                      {country.name}
                    </span>
                    <span className="text-sm text-muted tabular-nums shrink-0">
                      {country.dialCode}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted">
                  Ничего не найдено
                </div>
              )}
            </div>

            <div className="mt-5 md:hidden">
              <Button
                className="w-full py-3.5 text-base justify-center"
                onClick={closeDropdown}
              >
                Готово
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="flex items-center gap-1 text-sm mt-0.5">
          <WarningIcon className="size-4 shrink-0" />
          <span className="text-[#DF1C41]">{error}</span>
        </span>
      )}

      {hint && <span className="text-sm text-muted mt-0.5">{hint}</span>}
    </div>
  );
};
