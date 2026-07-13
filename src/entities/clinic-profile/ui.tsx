"use client";

import {
  type FC,
  type SVGProps,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import type { UpdateClinicProfileBody } from "@/shared/api";
import { colors } from "@/shared/config";
import { Button, Input, PhoneInput, Textarea } from "@/shared/ui";

import type { ClinicProfile } from "./model";

// ─── Icons ─────────────────────────────────────────────────────────────────

const UploadIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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

const PinIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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

// Карта локации — keyless Google Maps embed (без API-ключа): по факту
// координат показывает пин, без них — просто область по адресу/названию.
const LocationMap: FC<{
  latitude?: string;
  longitude?: string;
  address?: string;
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

const FileIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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

// ─── Sub-components ─────────────────────────────────────────────────────────

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-3xl p-5 lg:p-6 border border-border mb-6">
    <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

// Строка вида «label / значение» с тонким разделителем — тот же паттерн, что
// в унифицированной странице «Мои данные» врача (@/widgets/doctor/layout).
const FieldRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="py-3 border-b border-background last:border-b-0">
    <div className="text-muted text-sm mb-1">{label}</div>
    <div className="text-foreground font-medium text-base">
      {children || "—"}
    </div>
  </div>
);

// ─── Schedule helpers ────────────────────────────────────────────────────────

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAY_LABELS: { key: DayKey; ru: string }[] = [
  { key: "mon", ru: "ПН" },
  { key: "tue", ru: "ВТ" },
  { key: "wed", ru: "СР" },
  { key: "thu", ru: "ЧТ" },
  { key: "fri", ru: "ПТ" },
  { key: "sat", ru: "СБ" },
  { key: "sun", ru: "ВС" },
];

// Ключ формы → английское название дня (формат бэка)
const DAY_API: Record<DayKey, string> = {
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  fri: "friday",
  sat: "saturday",
  sun: "sunday",
};

type DayState = { open: string; close: string; enabled: boolean };

type FormState = {
  name: string;
  type: string;
  description: string;
  country: string;
  city: string;
  fullAddress: string;
  phone: string;
  website: string;
  latitude: string;
  longitude: string;
  legalName: string;
  registrationNumber: string;
  licenseNumber: string;
  licenseDate: string;
  licenseAuthority: string;
  mainDirections: string;
  narrowDirections: string;
  additionalServices: string;
  equipment: string;
  patientConditions: string;
  paymentMethods: string;
  days: Record<DayKey, DayState>;
  lunchStart: string;
  lunchEnd: string;
  emergency24: boolean;
};

const buildState = (p: ClinicProfile): FormState => ({
  name: p.name ?? "",
  type: p.type ?? "",
  description: p.description ?? "",
  country: p.country ?? "",
  city: p.city ?? "",
  fullAddress: p.fullAddress ?? "",
  phone: p.phone ?? "",
  website: p.website ?? "",
  latitude: p.latitude ?? "",
  longitude: p.longitude ?? "",
  legalName: p.legalName ?? "",
  registrationNumber: p.registrationNumber ?? "",
  licenseNumber: p.licenseNumber ?? "",
  licenseDate: p.licenseDate ?? "",
  licenseAuthority: p.licenseAuthority ?? "",
  mainDirections: p.mainDirections.join(", "),
  narrowDirections: p.narrowDirections.join(", "),
  additionalServices: p.additionalServices.join(", "),
  equipment: p.equipment.join(", "),
  patientConditions: p.patientConditions.join(", "),
  paymentMethods: p.paymentMethods.join(", "),
  days: {
    mon: toDay(p.workSchedule.mon),
    tue: toDay(p.workSchedule.tue),
    wed: toDay(p.workSchedule.wed),
    thu: toDay(p.workSchedule.thu),
    fri: toDay(p.workSchedule.fri),
    sat: toDay(p.workSchedule.sat),
    sun: toDay(p.workSchedule.sun),
  },
  lunchStart: p.workSchedule.lunchStart ?? "",
  lunchEnd: p.workSchedule.lunchEnd ?? "",
  emergency24: p.workSchedule.emergency24 ?? false,
});

const toDay = (d: {
  open?: string;
  close?: string;
  enabled?: boolean;
}): DayState => ({
  open: d?.open ?? "",
  close: d?.close ?? "",
  enabled: d?.enabled ?? false,
});

const csv = (s: string): string[] =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; уже-ISO/пусто отдаём как есть
const toApiDate = (v: string): string | null => {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
};

// ─── Main Component ─────────────────────────────────────────────────────────

export type ClinicProfileFormHandle = {
  getPayload: () => UpdateClinicProfileBody;
};

type Props = ClinicProfile & { isEditing?: boolean };

export const ClinicProfileForm = forwardRef<ClinicProfileFormHandle, Props>(
  (props, ref) => {
    const {
      isEditing = false,
      name,
      logo,
      type,
      description,
      photos,
      country,
      city,
      fullAddress,
      phone,
      email,
      website,
      latitude,
      longitude,
      workSchedule,
      legalName,
      registrationNumber,
      licenseNumber,
      licenseDate,
      licenseAuthority,
      documents,
      mainDirections,
      narrowDirections,
      additionalServices,
      equipment,
      patientConditions,
      paymentMethods,
    } = props;

    const [d, setD] = useState<FormState>(() => buildState(props));
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | undefined>(logo);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // При входе в режим редактирования подхватываем актуальные значения профиля
    useEffect(() => {
      if (isEditing) {
        setD(buildState(props));
        setLogoFile(null);
        setLogoPreview(logo);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    useImperativeHandle(ref, () => ({
      getPayload: (): UpdateClinicProfileBody => ({
        name: d.name,
        clinic_type: d.type,
        description: d.description,
        phone: d.phone || undefined,
        website: d.website || undefined,
        country: d.country || undefined,
        city: d.city || undefined,
        address: d.fullAddress || undefined,
        latitude: d.latitude || undefined,
        longitude: d.longitude || undefined,
        legal_name: d.legalName || undefined,
        reg_number: d.registrationNumber || undefined,
        license_number: d.licenseNumber || undefined,
        license_date: toApiDate(d.licenseDate),
        license_authority: d.licenseAuthority || undefined,
        primary_specializations: csv(d.mainDirections),
        narrow_specializations: csv(d.narrowDirections),
        additional_services: d.additionalServices,
        equipment: csv(d.equipment),
        patient_conditions: csv(d.patientConditions),
        payment_methods: csv(d.paymentMethods),
        emergency_24_7: d.emergency24,
        schedule: Object.fromEntries(
          DAY_LABELS.map(({ key }) => [
            DAY_API[key],
            {
              from: d.days[key].open,
              to: d.days[key].close,
              enabled: d.days[key].enabled,
            },
          ]),
        ),
        lunch_break: { from: d.lunchStart, to: d.lunchEnd },
        ...(logoFile ? { logo: logoFile } : {}),
      }),
    }));

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
      setD((prev) => ({ ...prev, [k]: v }));

    const setDay = (key: DayKey, patch: Partial<DayState>) =>
      setD((prev) => ({
        ...prev,
        days: { ...prev.days, [key]: { ...prev.days[key], ...patch } },
      }));

    const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    };

    const days = d.days;

    return (
      <>
        {/* ── 1. Основная информация ─────────────────────────────────────── */}
        <SectionCard title="Основная информация">
          {isEditing ? (
            <>
              <div className="mb-6">
                <Input
                  label="Название"
                  value={d.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-secondary text-sm mb-2">
                  Логотип
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogo}
                />
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo"
                        width={96}
                        height={96}
                        sizes="96px"
                        unoptimized={logoPreview.startsWith("data:")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {d.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    IconLeft={UploadIcon}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Новый логотип
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <Input
                  label="Тип клиники"
                  value={d.type}
                  onChange={(e) => set("type", e.target.value)}
                />
              </div>

              <div className="mb-6">
                <Textarea
                  label="Описание"
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-secondary text-sm mb-2">
                  Фотографии
                </label>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0"
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">
                  Загрузка галереи фото — в разработке
                </p>
              </div>
            </>
          ) : (
            <div>
              <FieldRow label="Название">{name}</FieldRow>

              <div className="py-3 border-b border-background">
                <div className="text-muted text-sm mb-2">Логотип</div>
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                  {logo ? (
                    <Image
                      src={logo}
                      alt="Logo"
                      width={96}
                      height={96}
                      sizes="96px"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <FieldRow label="Тип">{type}</FieldRow>
              <FieldRow label="Описание">{description}</FieldRow>

              <div className="pt-3">
                <div className="text-muted text-sm mb-2">Фотографии</div>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0"
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 2. Локация и контакты ──────────────────────────────────────── */}
        <SectionCard title="Локация и контакты">
          {isEditing ? (
            <div className="flex flex-col gap-6">
              <Input
                label="Страна"
                value={d.country}
                onChange={(e) => set("country", e.target.value)}
              />
              <Input
                label="Город"
                value={d.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <Input
                label="Полный адрес"
                value={d.fullAddress}
                onChange={(e) => set("fullAddress", e.target.value)}
              />
              <PhoneInput
                label="Телефон"
                value={d.phone}
                onChange={(v) => set("phone", v)}
              />
              <Input label="Почта" type="email" value={email} disabled />
              <Input
                label="Сайт"
                type="url"
                value={d.website}
                onChange={(e) => set("website", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Широта"
                  value={d.latitude}
                  onChange={(e) => set("latitude", e.target.value)}
                  placeholder="42.8746"
                />
                <Input
                  label="Долгота"
                  value={d.longitude}
                  onChange={(e) => set("longitude", e.target.value)}
                  placeholder="74.5698"
                />
              </div>
              <LocationMap
                latitude={d.latitude}
                longitude={d.longitude}
                address={d.fullAddress}
              />
            </div>
          ) : (
            <div>
              <FieldRow label="Страна">{country}</FieldRow>
              <FieldRow label="Город">{city}</FieldRow>
              <FieldRow label="Полный адрес">{fullAddress}</FieldRow>
              <FieldRow label="Телефон">{phone}</FieldRow>
              <FieldRow label="Почта">{email}</FieldRow>
              <FieldRow label="Сайт">{website}</FieldRow>
              <div className="pt-3">
                <div className="text-muted text-sm mb-2">Геолокация</div>
                <LocationMap
                  latitude={latitude}
                  longitude={longitude}
                  address={fullAddress}
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 3. Расписание ─────────────────────────────────────────────── */}
        <SectionCard title="Расписание">
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-4">
              График работы
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-3">
                {DAY_LABELS.map(({ key, ru }) => {
                  const day = days[key];
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-secondary shrink-0">
                        {ru}
                      </span>
                      <input
                        type="time"
                        value={day.open}
                        disabled={!day.enabled}
                        onChange={(e) => setDay(key, { open: e.target.value })}
                        className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-40"
                      />
                      <span className="text-muted">–</span>
                      <input
                        type="time"
                        value={day.close}
                        disabled={!day.enabled}
                        onChange={(e) => setDay(key, { close: e.target.value })}
                        className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-40"
                      />
                      <label className="flex items-center gap-2 ml-2 text-sm text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) =>
                            setDay(key, { enabled: e.target.checked })
                          }
                          className="accent-primary"
                        />
                        Рабочий
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {DAY_LABELS.filter(({ key }) => days[key].enabled).map(
                  ({ key, ru }) => {
                    const day = days[key];
                    return (
                      <div key={key} className="flex items-center gap-6">
                        <span className="w-8 text-sm text-secondary">{ru}</span>
                        <span className="text-sm text-foreground">
                          {day.open}
                          <span className="mx-2 text-muted">–</span>
                          {day.close}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-3">
              Обеденный перерыв
            </div>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={d.lunchStart}
                  onChange={(e) => set("lunchStart", e.target.value)}
                  className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-muted">–</span>
                <input
                  type="time"
                  value={d.lunchEnd}
                  onChange={(e) => set("lunchEnd", e.target.value)}
                  className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            ) : (
              <span className="text-sm text-foreground">
                {workSchedule.lunchStart}
                <span className="mx-2 text-muted">–</span>
                {workSchedule.lunchEnd}
              </span>
            )}
          </div>

          {isEditing ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={d.emergency24}
                onChange={(e) => set("emergency24", e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-foreground">
                Экстренный приём 24/7
              </span>
            </label>
          ) : (
            workSchedule.emergency24 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary shrink-0" />
                <span className="text-sm text-foreground">
                  Экстренный приём 24/7
                </span>
              </div>
            )
          )}
        </SectionCard>

        {/* ── 4. Юридическая информация ─────────────────────────────────── */}
        <SectionCard title="Юридическая информация">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Юридическое название"
                value={d.legalName}
                onChange={(e) => set("legalName", e.target.value)}
                className="md:col-span-2"
              />
              <Input
                label="Регистрационный номер"
                value={d.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
              />
              <Input
                label="Номер лицензии"
                value={d.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
              />
              <Input
                label="Дата выдачи лицензии"
                value={d.licenseDate}
                onChange={(e) => set("licenseDate", e.target.value)}
                placeholder="ГГГГ-ММ-ДД"
              />
              <Input
                label="Орган, выдавший лицензию"
                value={d.licenseAuthority}
                onChange={(e) => set("licenseAuthority", e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="block text-secondary text-sm mb-2">
                  Документы (лицензии, регистрационные документы)
                </label>
                <div className="flex flex-wrap gap-4">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <FileIcon />
                      <span className="text-xs text-secondary max-w-20 text-center truncate">
                        {doc.name}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">
                  Загрузка документов — в разработке
                </p>
              </div>
            </div>
          ) : (
            <div>
              <FieldRow label="Юридическое название">{legalName}</FieldRow>
              <FieldRow label="Регистрационный номер">
                {registrationNumber}
              </FieldRow>
              <FieldRow label="Номер лицензии">{licenseNumber}</FieldRow>
              <FieldRow label="Дата выдачи лицензии">{licenseDate}</FieldRow>
              <FieldRow label="Орган, выдавший лицензию">
                {licenseAuthority}
              </FieldRow>
              <div className="pt-3">
                <div className="text-muted text-sm mb-2">
                  Документы (лицензии, регистрационные документы)
                </div>
                <div className="flex flex-wrap gap-4">
                  {documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                    >
                      <FileIcon />
                      <span className="text-xs text-secondary max-w-20 text-center truncate">
                        {doc.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 5. Специализация и услуги ─────────────────────────────────── */}
        <SectionCard title="Специализация и услуги">
          {isEditing ? (
            <div className="flex flex-col gap-6">
              <Textarea
                label="Основные направления"
                value={d.mainDirections}
                onChange={(e) => set("mainDirections", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
              <Textarea
                label="Узкие направления"
                value={d.narrowDirections}
                onChange={(e) => set("narrowDirections", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
              <Textarea
                label="Дополнительные услуги"
                value={d.additionalServices}
                onChange={(e) => set("additionalServices", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
            </div>
          ) : (
            <div>
              <FieldRow label="Основные направления">
                {mainDirections.join(", ")}
              </FieldRow>
              <FieldRow label="Узкие направления">
                {narrowDirections.join(", ")}
              </FieldRow>
              <FieldRow label="Дополнительные услуги">
                {additionalServices.join(", ")}
              </FieldRow>
            </div>
          )}
        </SectionCard>

        {/* ── 6. Оборудование и условия ─────────────────────────────────── */}
        <SectionCard title="Оборудование и условия">
          {isEditing ? (
            <div className="flex flex-col gap-6">
              <Textarea
                label="Оборудование"
                value={d.equipment}
                onChange={(e) => set("equipment", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
              <Textarea
                label="Условия для пациентов"
                value={d.patientConditions}
                onChange={(e) => set("patientConditions", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
              <Textarea
                label="Способы оплаты"
                value={d.paymentMethods}
                onChange={(e) => set("paymentMethods", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs text-muted mb-2">Оборудование</div>
                <ul className="flex flex-col gap-1">
                  {equipment.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-foreground flex items-center gap-2"
                    >
                      <span className="text-muted">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted mb-2">
                  Условия для пациентов
                </div>
                <ul className="flex flex-col gap-1">
                  {patientConditions.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-foreground flex items-center gap-2"
                    >
                      <span className="text-muted">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted mb-2">Способы оплаты</div>
                <ul className="flex flex-col gap-1">
                  {paymentMethods.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-foreground flex items-center gap-2"
                    >
                      <span className="text-muted">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </SectionCard>
      </>
    );
  },
);

ClinicProfileForm.displayName = "ClinicProfileForm";
