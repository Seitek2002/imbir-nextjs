"use client";

import { useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Button, Checkbox, Dropdown, Input, Textarea } from "@/shared/ui";

export type ClinicStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ScheduleDay = { from: string; to: string };

type ClinicFormData = {
  clinicName: string;
  logo: File | null;
  clinicType: string;
  description: string;
  photos: File[];

  country: string;
  city: string;
  fullAddress: string;
  phone: string;
  email: string;
  website: string;

  schedule: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    ScheduleDay
  >;
  lunchBreak: ScheduleDay;
  emergency247: boolean;

  legalName: string;
  registrationNumber: string;
  licenseNumber: string;
  licenseDate: string;
  licensingAuthority: string;
  documents: File[];

  mainDirections: string;
  narrowDirections: string;
  additionalServices: string;

  equipment: string[];
  patientConditions: string[];
  paymentMethods: string[];

  agreeRules: boolean;
  agreePrivacy: boolean;
  agreeDataProcessing: boolean;
  agreeAccuracy: boolean;
};

const CLINIC_TYPES = [
  { label: "Частная", value: "private" },
  { label: "Государственная", value: "public" },
  { label: "Многопрофильная", value: "multi" },
  { label: "Специализированная", value: "specialized" },
];

const COUNTRIES = [
  { label: "Кыргызстан", value: "kg" },
  { label: "Казахстан", value: "kz" },
  { label: "Россия", value: "ru" },
];

const CITIES = [
  { label: "Бишкек", value: "bishkek" },
  { label: "Ош", value: "osh" },
  { label: "Джалал-Абад", value: "jalal-abad" },
  { label: "Каракол", value: "karakol" },
];

const DAYS: {
  key: keyof ClinicFormData["schedule"];
  label: string;
}[] = [
  { key: "mon", label: "ПН" },
  { key: "tue", label: "ВТ" },
  { key: "wed", label: "СР" },
  { key: "thu", label: "ЧТ" },
  { key: "fri", label: "ПТ" },
  { key: "sat", label: "СБ" },
  { key: "sun", label: "ВС" },
];

const EQUIPMENT_OPTIONS = [
  "УЗИ",
  "КТ/МРТ",
  "Операционная",
  "Рентген",
  "Лаборатория",
  "Реанимация",
];
const PATIENT_CONDITIONS = [
  "Парковка",
  "Детская зона",
  "Онлайн-консультация",
  "Доступ для инвалидов",
  "Аптека",
];
const PAYMENT_OPTIONS = ["Наличные", "Карта", "Онлайн"];

const STEP_TITLES: Record<ClinicStep, string> = {
  1: "Основная информация",
  2: "Локация и контакты",
  3: "График работы",
  4: "Юридическая информация",
  5: "Специализация и услуги",
  6: "Оборудование и условия",
  7: "Завершение регистрации",
};

const TOTAL_STEPS = 7;

// --- Sub-components ---

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M22 18v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 6v12M10 10l4-4 4 4"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="shrink-0 mt-0.5"
  >
    <circle cx="9" cy="9" r="8" stroke="#838A8D" strokeWidth="1.5" />
    <path
      d="M9 8v5M9 6h.01"
      stroke="#838A8D"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 1.667A5.833 5.833 0 0110 13.333C6.667 13.333 4.167 8.333 4.167 7.5a5.833 5.833 0 015.833-5.833z"
      stroke="#F5653E"
      strokeWidth="1.5"
    />
    <circle cx="10" cy="7.5" r="2" fill="#F5653E" />
  </svg>
);

const PhotoThumb = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => (
  <div className="relative flex flex-col items-center gap-1">
    <div className="relative size-16 rounded-lg overflow-hidden border border-[#E5E6E8] bg-[#F2F3F5]">
      {file.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#838A8D] font-bold">
          FILE
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/60 flex items-center justify-center text-white text-[10px] leading-none"
      >
        ×
      </button>
    </div>
    <span className="text-[10px] text-[#838A8D] max-w-[64px] truncate">
      {file.name}
    </span>
  </div>
);

const TimeRange = ({
  value,
  onChange,
}: {
  value: ScheduleDay;
  onChange: (v: ScheduleDay) => void;
}) => (
  <div className="flex items-center gap-2">
    <input
      type="time"
      value={value.from}
      onChange={(e) => onChange({ ...value, from: e.target.value })}
      className="flex-1 py-2 px-3 rounded-lg border border-[#E5E6E8] text-sm text-[#191A1B] text-center outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]"
    />
    <span className="text-[#838A8D] shrink-0">—</span>
    <input
      type="time"
      value={value.to}
      onChange={(e) => onChange({ ...value, to: e.target.value })}
      className="flex-1 py-2 px-3 rounded-lg border border-[#E5E6E8] text-sm text-[#191A1B] text-center outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]"
    />
  </div>
);

const CheckboxGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-[#0D0D12]">{label}</span>
    <div className="rounded-xl border border-[#E5E6E8] divide-y divide-[#E5E6E8]">
      {options.map((opt) => (
        <div key={opt} className="px-4 py-3">
          <Checkbox
            label={opt}
            checked={value.includes(opt)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...value, opt]
                  : value.filter((v) => v !== opt),
              )
            }
          />
        </div>
      ))}
    </div>
  </div>
);

// --- Main component ---

type Props = {
  step: ClinicStep;
  onContinue: () => void;
};

export const ClinicRegistrationForm = ({ step, onContinue }: Props) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const emptyDay: ScheduleDay = { from: "", to: "" };

  const [data, setData] = useState<ClinicFormData>({
    clinicName: "",
    logo: null,
    clinicType: "",
    description: "",
    photos: [],

    country: "",
    city: "",
    fullAddress: "",
    phone: "+996 ",
    email: "",
    website: "",

    schedule: {
      mon: emptyDay,
      tue: emptyDay,
      wed: emptyDay,
      thu: emptyDay,
      fri: emptyDay,
      sat: emptyDay,
      sun: emptyDay,
    },
    lunchBreak: emptyDay,
    emergency247: false,

    legalName: "",
    registrationNumber: "",
    licenseNumber: "",
    licenseDate: "",
    licensingAuthority: "",
    documents: [],

    mainDirections: "",
    narrowDirections: "",
    additionalServices: "",

    equipment: [],
    patientConditions: [],
    paymentMethods: [],

    agreeRules: false,
    agreePrivacy: false,
    agreeDataProcessing: false,
    agreeAccuracy: false,
  });

  const set = <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => setData((prev) => ({ ...prev, [key]: value }));

  const setDay = (day: keyof ClinicFormData["schedule"], value: ScheduleDay) =>
    setData((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [day]: value },
    }));

  const allAgreed =
    data.agreeRules &&
    data.agreePrivacy &&
    data.agreeDataProcessing &&
    data.agreeAccuracy;

  const isValid =
    step === 1 ? !!data.clinicName : step === 7 ? allAgreed : true;

  const handleContinue = () => {
    if (step < 7) onContinue();
    else console.log("Clinic registration:", data);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6 md:mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              i < step ? "bg-[#F5653E]" : "bg-[#E3E4E5]",
            )}
          />
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-[#191A1B] mb-6">
        {STEP_TITLES[step]}
      </h2>

      {/* ── Step 1: Basic info ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Input
            label="Название клиники"
            placeholder="Введите название"
            value={data.clinicName}
            onChange={(e) => set("clinicName", e.target.value)}
          />

          {/* Logo upload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">Логотип</span>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) set("logo", file);
              }}
            />
            {data.logo ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E6E8]">
                <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={URL.createObjectURL(data.logo)}
                    alt="логотип"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => set("logo", null)}
                    className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/60 flex items-center justify-center text-white text-[10px] leading-none"
                  >
                    ×
                  </button>
                </div>
                <span className="text-sm text-[#838A8D] truncate flex-1">
                  {data.logo.name}
                </span>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="size-8 rounded-full bg-[#F5653E] flex items-center justify-center text-white text-lg shrink-0"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[#E5E6E8] hover:border-[#F5653E]/40 transition-colors w-full"
              >
                <UploadIcon />
                <span className="text-sm font-medium text-[#0D0D12]">
                  Загрузить логотип
                </span>
              </button>
            )}
          </div>

          <Dropdown
            label="Тип клиники"
            placeholder="Выберите из списка"
            options={CLINIC_TYPES}
            value={data.clinicType}
            onChange={(v) => set("clinicType", v)}
          />

          <Input
            label="Описание клиники"
            placeholder="Введите описание клиники"
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
          />

          {/* Clinic photos upload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">
              Фотографии клиники
            </span>
            <input
              ref={photosInputRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                if (!e.target.files) return;
                set("photos", [...data.photos, ...Array.from(e.target.files)]);
                e.target.value = "";
              }}
            />
            <div className="p-3 rounded-xl border border-[#E5E6E8] min-h-[88px]">
              {data.photos.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {data.photos.map((file, i) => (
                    <PhotoThumb
                      key={i}
                      file={file}
                      onRemove={() =>
                        set(
                          "photos",
                          data.photos.filter((_, idx) => idx !== i),
                        )
                      }
                    />
                  ))}
                  <button
                    onClick={() => photosInputRef.current?.click()}
                    className="size-16 rounded-lg border-2 border-dashed border-[#E5E6E8] flex items-center justify-center text-[#F5653E] text-2xl hover:border-[#F5653E]/40 transition-colors"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => photosInputRef.current?.click()}
                  className="w-full min-h-[72px] flex items-center justify-center gap-2"
                >
                  <UploadIcon />
                  <span className="text-sm font-medium text-[#0D0D12]">
                    Загрузить фото
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Location & contacts ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Dropdown
            label="Страна"
            placeholder="Выберите из списка"
            options={COUNTRIES}
            value={data.country}
            onChange={(v) => set("country", v)}
          />
          <Dropdown
            label="Город"
            placeholder="Выберите из списка"
            options={CITIES}
            value={data.city}
            onChange={(v) => set("city", v)}
          />
          <Input
            label="Полный адрес"
            placeholder="Введите полный адрес"
            value={data.fullAddress}
            onChange={(e) => set("fullAddress", e.target.value)}
          />
          <Input
            label="Телефон"
            placeholder="+996 ХХХ ХХХ ХХХ"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label="Почта"
            type="email"
            placeholder="Введите вашу почту"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <Input
            label="Сайт (если есть)"
            placeholder="Введите ссылку на сайт"
            value={data.website}
            onChange={(e) => set("website", e.target.value)}
          />

          {/* Map placeholder */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">
              Геолокация
            </span>
            <div className="rounded-xl overflow-hidden border border-[#E5E6E8]">
              {/* Map tile placeholder */}
              <div className="relative h-44 bg-[#E8EAED] flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  {/* Grid lines simulating a map */}
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="#888"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                {/* Map pin */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="size-10 rounded-full bg-[#F5653E] flex items-center justify-center shadow-lg">
                    <MapPinIcon />
                  </div>
                </div>
                {/* Navigation button */}
                <button className="absolute bottom-3 right-3 size-9 bg-white rounded-full shadow flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1l2.5 13L8 11.5 5.5 14 8 1z"
                      stroke="#F5653E"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              {/* Address label */}
              <div className="px-4 py-3 bg-white flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M8 1.333A4.667 4.667 0 018 10.667C5.333 10.667 3.333 6.667 3.333 6a4.667 4.667 0 014.667-4.667z"
                    stroke="#838A8D"
                    strokeWidth="1.2"
                  />
                  <circle cx="8" cy="6" r="1.5" fill="#838A8D" />
                </svg>
                <span className="text-sm text-[#191A1B]">
                  {data.fullAddress || "Выберите адрес на карте"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Work schedule ── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-[#838A8D] -mt-2">
            Укажите время проведения процедуры (с какого времени до какого),
            оставьте поля пустыми, если в какой-то день процедура не проводится
          </p>

          <div className="flex flex-col gap-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#0D0D12] w-6 shrink-0">
                  {label}
                </span>
                <div className="flex-1">
                  <TimeRange
                    value={data.schedule[key]}
                    onChange={(v) => setDay(key, v)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#0D0D12]">
              Обеденный перерыв
            </span>
            <TimeRange
              value={data.lunchBreak}
              onChange={(v) => set("lunchBreak", v)}
            />
          </div>

          <Checkbox
            label="Экстренный приём 24/7"
            checked={data.emergency247}
            onChange={(e) => set("emergency247", e.target.checked)}
          />
        </div>
      )}

      {/* ── Step 4: Legal info ── */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <Input
            label="Юридическое название"
            placeholder="Введите название"
            value={data.legalName}
            onChange={(e) => set("legalName", e.target.value)}
          />
          <Input
            label="Регистрационный номер"
            placeholder="Введите номер"
            value={data.registrationNumber}
            onChange={(e) => set("registrationNumber", e.target.value)}
          />
          <Input
            label="Номер лицензии"
            placeholder="Введите номер"
            value={data.licenseNumber}
            onChange={(e) => set("licenseNumber", e.target.value)}
          />
          <Input
            label="Дата выдачи лицензии"
            placeholder="ДД.ММ.ГГГГ"
            value={data.licenseDate}
            onChange={(e) => set("licenseDate", e.target.value)}
          />
          <Input
            label="Орган, выдавший лицензию"
            placeholder="Введите название органа"
            value={data.licensingAuthority}
            onChange={(e) => set("licensingAuthority", e.target.value)}
          />

          {/* Documents upload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">
              Документы (лицензия, регистрационные документы)
            </span>
            <input
              ref={docsInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,image/*"
              className="sr-only"
              onChange={(e) => {
                if (!e.target.files) return;
                set("documents", [
                  ...data.documents,
                  ...Array.from(e.target.files),
                ]);
                e.target.value = "";
              }}
            />
            <div className="p-4 rounded-xl border-2 border-dashed border-[#E5E6E8] min-h-[112px]">
              {data.documents.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {data.documents.map((file, i) => (
                    <PhotoThumb
                      key={i}
                      file={file}
                      onRemove={() =>
                        set(
                          "documents",
                          data.documents.filter((_, idx) => idx !== i),
                        )
                      }
                    />
                  ))}
                  <button
                    onClick={() => docsInputRef.current?.click()}
                    className="size-16 rounded-lg border-2 border-dashed border-[#E5E6E8] flex items-center justify-center text-[#F5653E] text-2xl hover:border-[#F5653E]/40 transition-colors"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => docsInputRef.current?.click()}
                  className="w-full min-h-[80px] flex items-center justify-center gap-2"
                >
                  <UploadIcon />
                  <span className="text-sm font-medium text-[#0D0D12]">
                    Загрузить документы
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 5: Specialization & services ── */}
      {step === 5 && (
        <div className="flex flex-col gap-4">
          <Textarea
            label="Основные направления"
            placeholder="Терапия, Кардиология, Педиатрия..."
            rows={3}
            value={data.mainDirections}
            onChange={(e) => set("mainDirections", e.target.value)}
          />
          <Textarea
            label="Узкие направления"
            placeholder="Эндокринолог, Невролог, Офтальмолог..."
            rows={3}
            value={data.narrowDirections}
            onChange={(e) => set("narrowDirections", e.target.value)}
          />
          <Textarea
            label="Дополнительные услуги"
            placeholder="Анализы, УЗИ, Рентген..."
            rows={3}
            value={data.additionalServices}
            onChange={(e) => set("additionalServices", e.target.value)}
          />
        </div>
      )}

      {/* ── Step 6: Equipment & conditions ── */}
      {step === 6 && (
        <div className="flex flex-col gap-5">
          <CheckboxGroup
            label="Оборудование"
            options={EQUIPMENT_OPTIONS}
            value={data.equipment}
            onChange={(v) => set("equipment", v)}
          />
          <CheckboxGroup
            label="Условия для пациентов"
            options={PATIENT_CONDITIONS}
            value={data.patientConditions}
            onChange={(v) => set("patientConditions", v)}
          />
          <CheckboxGroup
            label="Способы оплаты"
            options={PAYMENT_OPTIONS}
            value={data.paymentMethods}
            onChange={(v) => set("paymentMethods", v)}
          />
        </div>
      )}

      {/* ── Step 7: Completion ── */}
      {step === 7 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">
              Согласия и политики
            </span>
            <div className="rounded-xl border border-[#E5E6E8] divide-y divide-[#E5E6E8]">
              {(
                [
                  {
                    key: "agreeRules" as const,
                    label: "Я согласен с правилами платформы",
                  },
                  {
                    key: "agreePrivacy" as const,
                    label: "Я согласен с политикой конфиденциальности",
                  },
                  {
                    key: "agreeDataProcessing" as const,
                    label: "Я даю согласие на обработку персональных данных",
                  },
                  {
                    key: "agreeAccuracy" as const,
                    label:
                      "Подтверждаю, что предоставленная информация соответствует действительности",
                  },
                ] satisfies { key: keyof ClinicFormData; label: string }[]
              ).map(({ key, label }) => (
                <div key={key} className="px-4 py-3">
                  <Checkbox
                    label={label}
                    checked={data[key] as boolean}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-xl bg-[#F2F3F5] mt-2">
            <InfoIcon />
            <p className="text-sm text-[#838A8D]">
              После регистрации вы получите доступ к личному кабинету врача, где
              сможете управлять расписанием, просматривать записи пациентов и
              вести историю приёмов
            </p>
          </div>
        </div>
      )}

      {/* Spacer for mobile fixed button */}
      <div className="h-24 md:hidden" />

      {/* Mobile: fixed bottom button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-[#E5E6E8]">
        <Button
          className="w-full justify-center h-14 text-base"
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
        >
          {step === 7 ? "Завершить регистрацию" : "Продолжить"}
        </Button>
      </div>

      {/* Desktop: inline button */}
      <div className="hidden md:block mt-auto pt-10">
        <Button
          className="w-full justify-center md:h-14 md:text-lg"
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
        >
          {step === 7 ? "Завершить регистрацию" : "Продолжить"}
        </Button>
      </div>
    </div>
  );
};
