"use client";

import { type FC, type SVGProps } from "react";

import { colors } from "@/shared/config";

// ─── Icons ─────────────────────────────────────────────────────────────────

export const UploadIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M2 11L2 14L5 14M14 5L14 2L11 2M5 2L2 2L2 5M11 14L14 14L14 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PinIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M13.3333 6.66667C13.3333 10.6667 8 14.6667 8 14.6667C8 14.6667 2.66667 10.6667 2.66667 6.66667C2.66667 5.25218 3.22857 3.89563 4.22876 2.89543C5.22896 1.89524 6.58551 1.33333 8 1.33333C9.41449 1.33333 10.771 1.89524 11.7712 2.89543C12.7714 3.89563 13.3333 5.25218 13.3333 6.66667Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FileIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
    <rect width="32" height="32" rx="8" fill="#F2F4F7" />
    <path
      d="M11 10C11 9.44772 11.4477 9 12 9H19.5858C19.851 9 20.1054 9.10536 20.2929 9.29289L22.7071 11.7071C22.8946 11.8946 23 12.149 23 12.4142V22C23 22.5523 22.5523 23 22 23H12C11.4477 23 11 22.5523 11 22V10Z"
      stroke={colors.secondary}
      strokeWidth="1.5"
    />
    <path
      d="M19 9V12C19 12.5523 19.4477 13 20 13H23"
      stroke={colors.secondary}
      strokeWidth="1.5"
    />
  </svg>
);

// ─── Schedule helpers ────────────────────────────────────────────────────────

export type DayKey = "fri" | "mon" | "sat" | "sun" | "thu" | "tue" | "wed";

export const DAY_LABELS: { key: DayKey; ru: string }[] = [
  { key: "mon", ru: "ПН" },
  { key: "tue", ru: "ВТ" },
  { key: "wed", ru: "СР" },
  { key: "thu", ru: "ЧТ" },
  { key: "fri", ru: "ПТ" },
  { key: "sat", ru: "СБ" },
  { key: "sun", ru: "ВС" },
];

// Ключ формы → английское название дня (формат бэка)
export const DAY_API: Record<DayKey, string> = {
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  fri: "friday",
  sat: "saturday",
  sun: "sunday",
};

export type DayState = { close: string; enabled: boolean; open: string };

export const toDay = (d: {
  close?: string;
  enabled?: boolean;
  open?: string;
}): DayState => ({
  open: d?.open ?? "",
  close: d?.close ?? "",
  enabled: d?.enabled ?? false,
});

export const csv = (s: string): string[] =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; уже-ISO/пусто отдаём как есть
export const toApiDate = (v: string): null | string => {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
};

// Обратное преобразование: бэк отдаёт дату как "ГГГГ-ММ-ДД", формы — как
// "ДД.ММ.ГГГГ". Без этого DateField получает ISO-строку и валит её как
// несуществующую дату.
export const fromApiDate = (v: null | string | undefined): string => {
  const t = (v ?? "").trim();
  if (!t) return "";
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : t;
};

// ─── Layout primitives ──────────────────────────────────────────────────────

export const SectionCard = ({
  title,
  children,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="bg-white rounded-3xl p-5 lg:p-6 border border-border mb-6">
    <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

// Просмотр времени в режиме "не редактируется" — та же рамка, что у полей
// ввода времени, просто без интерактивности. По макету значение в режиме
// просмотра остаётся в рамке, а не превращается в голый текст.
export const TimeChip = ({ children }: { children: string }) => (
  <span className="w-24 rounded-xl border border-border bg-white px-3 py-2 text-center text-sm text-foreground tabular-nums">
    {children}
  </span>
);

// Строка вида «label / значение» с тонким разделителем — используется во всех
// разделах «Моя клиника» (и на едином десктоп-экране, и на мобильных
// экранах-разделах), тот же паттерн, что в «Мои данные» врача.
export const FieldRow = ({
  label,
  children,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="py-3 border-b border-background last:border-b-0">
    <div className="text-muted text-sm mb-1">{label}</div>
    <div className="text-foreground font-medium text-base">
      {children || "—"}
    </div>
  </div>
);

// Карта локации — keyless Google Maps embed (без API-ключа): по факту
// координат показывает пин, без них — просто область по адресу/названию.
export const LocationMap: FC<{
  address?: string;
  latitude?: string;
  longitude?: string;
}> = ({ latitude, longitude, address }) => {
  const query =
    latitude && longitude ? `${latitude},${longitude}` : address || "";
  if (!query) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <iframe
        title="Геолокация клиники"
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        className="w-full h-50 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {address && (
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <PinIcon className="text-primary shrink-0" />
          <span className="text-sm text-foreground">{address}</span>
        </div>
      )}
    </div>
  );
};
