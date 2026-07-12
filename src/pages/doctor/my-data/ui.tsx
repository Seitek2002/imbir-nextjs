"use client";

import { FC, ReactNode, useRef, useState } from "react";

import Image from "next/image";

import {
  DoctorPageLayout,
  FieldView,
  formStyles,
  useDoctorCabinet,
} from "@/widgets/doctor/layout";

import { PhoneInput } from "@/shared/ui";

const { inp, lbl } = formStyles;

const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

type FormState = {
  fullName: string;
  gender: string;
  birthDate: string;
  city: string;
  languages: string;
  phone: string;
  email: string;
  photo?: string;
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string[];
  licenseNumber: string;
  certificates: string[];
};

const EMPTY: FormState = {
  fullName: "",
  gender: "",
  birthDate: "",
  city: "",
  languages: "",
  phone: "",
  email: "",
  photo: undefined,
  specialty: "",
  additionalSpecialty: "",
  experienceYears: "",
  currentPosition: "",
  workplace: "",
  qualification: "",
  scientificDegree: "",
  university: "",
  graduationYear: "",
  internship: "",
  residency: "",
  diplomaSpecialty: "",
  additionalEducation: [],
  licenseNumber: "",
  certificates: [],
};

const csv = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; уже-ISO значение оставляем как есть.
const toApiDate = (v: string): string | null => {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
};

// "ГГГГ-ММ-ДД" → "ДД.ММ.ГГГГ" для показа/редактирования.
const fromApiDate = (v: string): string => {
  const m = v?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : (v ?? "");
};

// Секция: заголовок + белая карточка.
const Section: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
    <div className="bg-white rounded-3xl border border-border p-5 lg:p-6">
      {children}
    </div>
  </div>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13 2v7h7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoctorMyDataPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile, rawProfile } =
    useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<FormState>(EMPTY);
  const photoRef = useRef<HTMLInputElement>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);

  // «adjust state during render» вместо setState в эффекте — синхронизируем
  // форму с пришедшим профилем.
  const [synced, setSynced] = useState(profile);
  if (profile && profile !== synced) {
    setSynced(profile);
    setD({
      fullName: profile.fullName,
      gender: profile.gender,
      birthDate: fromApiDate(profile.birthDate),
      city: profile.city,
      languages: profile.languages,
      phone: profile.phone,
      email: profile.email,
      photo: profile.photo,
      specialty: profile.specialty,
      additionalSpecialty: profile.additionalSpecialty,
      experienceYears: profile.experienceYears,
      currentPosition: profile.currentPosition,
      workplace: profile.workplace,
      qualification: profile.qualification,
      scientificDegree: profile.scientificDegree,
      university: profile.university,
      graduationYear: profile.graduationYear,
      internship: profile.internship,
      residency: profile.residency,
      diplomaSpecialty: profile.diplomaSpecialty,
      additionalEducation: profile.additionalEducation,
      licenseNumber: profile.licenseNumber,
      certificates: profile.certificates,
    });
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const parts = d.fullName.trim().split(/\s+/);
    const existing =
      (rawProfile as unknown as { work_experience?: Record<string, unknown>[] })
        ?.work_experience?.[0] ?? {};
    const mainEdu = d.university
      ? [
          {
            institution: d.university,
            degree: d.diplomaSpecialty,
            year: parseInt(d.graduationYear) || new Date().getFullYear(),
          },
        ]
      : [];
    const addEdu = d.additionalEducation
      .filter(Boolean)
      .map((e) => ({ institution: e, degree: "", year: 0 }));

    await saveProfile({
      first_name: parts[0] ?? "",
      last_name: parts.slice(1).join(" ") || (parts[0] ?? ""),
      gender: d.gender || undefined,
      birth_date: toApiDate(d.birthDate),
      city: d.city,
      languages: csv(d.languages),
      phone: d.phone || undefined,
      ...(pendingPhoto ? { photo: pendingPhoto } : {}),
      primary_specializations: d.specialty ? [d.specialty] : [],
      narrow_specializations: d.additionalSpecialty
        ? [d.additionalSpecialty]
        : [],
      experience_years: parseInt(d.experienceYears) || 0,
      work_experience: [
        {
          ...existing,
          position: d.currentPosition,
          clinic: d.workplace,
          qualification: d.qualification,
          scientific_degree: d.scientificDegree,
        },
      ],
      education: [...mainEdu, ...addEdu],
      license_number: d.licenseNumber,
    });
    setPendingPhoto(null);
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать данные" : "Мои данные";

  // Поле только для чтения (в макете — строка с тонким разделителем).
  const view = (label: string, value: string | string[]) => (
    <div className="py-3 border-b border-background last:border-b-0">
      <FieldView label={label} value={value} />
    </div>
  );

  // Поле-инпут (режим редактирования).
  const field = (label: string, node: ReactNode) => (
    <div>
      <label className={lbl}>{label}</label>
      {node}
    </div>
  );

  if (isLoading) {
    return (
      <DoctorPageLayout title="Мои данные">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </DoctorPageLayout>
    );
  }

  return (
    <DoctorPageLayout
      title={title}
      editAction={isEditing ? "save" : "edit"}
      onEditToggle={isEditing ? handleSave : () => setIsEditing(true)}
    >
      {/* Desktop: заголовок + кнопка редактирования */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-60 ${
            isEditing
              ? "bg-primary text-white hover:bg-primary-dark"
              : "border border-border text-secondary hover:bg-surface"
          }`}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </button>
      </div>

      {/* ── Основная информация ─────────────────────────────── */}
      <Section title="Основная информация">
        {isEditing ? (
          <div className="flex flex-col gap-5">
            {field(
              "ФИО",
              <input
                value={d.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Введите ФИО"
                className={inp}
              />,
            )}
            {field(
              "Пол",
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("gender", value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-colors ${
                      d.gender === value
                        ? "border-primary"
                        : "border-border hover:border-dim"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        d.gender === value ? "border-primary" : "border-dim"
                      }`}
                    >
                      {d.gender === value && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="text-foreground text-sm">{label}</span>
                  </button>
                ))}
              </div>,
            )}
            {field(
              "Дата рождения",
              <input
                value={d.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
                placeholder="ДД.ММ.ГГГГ"
                className={inp}
              />,
            )}
            {field(
              "Город",
              <input
                value={d.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Введите город"
                className={inp}
              />,
            )}
            {field(
              "Языки общения",
              <input
                value={d.languages}
                onChange={(e) => set("languages", e.target.value)}
                placeholder="Русский, Английский"
                className={inp}
              />,
            )}
            <PhoneInput
              label="Телефон"
              value={d.phone.replace(/^\+?996/, "")}
              onChange={(v) => set("phone", v ? `+996${v}` : "")}
            />
            {field(
              "Почта",
              <input
                type="email"
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="example@mail.com"
                className={inp}
              />,
            )}
            <div>
              <label className={lbl}>Фото</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center shrink-0">
                  {d.photo ? (
                    <Image
                      src={d.photo}
                      alt={d.fullName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {d.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-secondary text-sm font-medium hover:bg-surface transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.5 2a1.7 1.7 0 012.4 2.4L5.6 12.7 2.4 13.6l.9-3.2L11.5 2z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Новое фото
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {view("ФИО", d.fullName)}
            {view(
              "Пол",
              GENDER_OPTIONS.find((g) => g.value === d.gender)?.label ??
                d.gender,
            )}
            {view("Дата рождения", d.birthDate)}
            {view("Город", d.city)}
            {view("Язык общения", d.languages)}
            {view("Телефон", d.phone)}
            {view("Почта", d.email)}
            <div className="py-3">
              <p className="text-muted text-sm mb-2">Фото</p>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                {d.photo ? (
                  <Image
                    src={d.photo}
                    alt={d.fullName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {d.fullName.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Профессиональные данные ─────────────────────────── */}
      <Section title="Профессиональные данные">
        {isEditing ? (
          <div className="flex flex-col gap-5">
            {field(
              "Специализация",
              <input
                value={d.specialty}
                onChange={(e) => set("specialty", e.target.value)}
                placeholder="Терапевт"
                className={inp}
              />,
            )}
            {field(
              "Дополнительная специализация",
              <input
                value={d.additionalSpecialty}
                onChange={(e) => set("additionalSpecialty", e.target.value)}
                placeholder="Кардиолог"
                className={inp}
              />,
            )}
            {field(
              "Стаж работы, лет",
              <input
                value={d.experienceYears}
                onChange={(e) => set("experienceYears", e.target.value)}
                placeholder="15"
                className={inp}
              />,
            )}
            {field(
              "Текущая должность",
              <input
                value={d.currentPosition}
                onChange={(e) => set("currentPosition", e.target.value)}
                placeholder="Главный врач"
                className={inp}
              />,
            )}
            {field(
              "Место работы (клиника)",
              <input
                value={d.workplace}
                onChange={(e) => set("workplace", e.target.value)}
                placeholder="K-MED"
                className={inp}
              />,
            )}
            {field(
              "Категория/Квалификация",
              <input
                value={d.qualification}
                onChange={(e) => set("qualification", e.target.value)}
                placeholder="Высшая"
                className={inp}
              />,
            )}
            {field(
              "Научная степень",
              <input
                value={d.scientificDegree}
                onChange={(e) => set("scientificDegree", e.target.value)}
                placeholder="Кандидат медицинских наук"
                className={inp}
              />,
            )}
          </div>
        ) : (
          <div>
            {view("Специализация", d.specialty)}
            {view("Дополнительная специализация", d.additionalSpecialty)}
            {view("Стаж работы, лет", d.experienceYears)}
            {view("Текущая должность", d.currentPosition)}
            {view("Место работы (клиника)", d.workplace)}
            {view("Категория/Квалификация", d.qualification)}
            {view("Научная степень", d.scientificDegree)}
          </div>
        )}
      </Section>

      {/* ── Образование ─────────────────────────────────────── */}
      <Section title="Образование">
        {isEditing ? (
          <div className="flex flex-col gap-5">
            {field(
              "ВУЗ",
              <input
                value={d.university}
                onChange={(e) => set("university", e.target.value)}
                placeholder="Название ВУЗа"
                className={inp}
              />,
            )}
            {field(
              "Год окончания",
              <input
                value={d.graduationYear}
                onChange={(e) => set("graduationYear", e.target.value)}
                placeholder="2010"
                className={inp}
              />,
            )}
            {field(
              "Интернатура",
              <input
                value={d.internship}
                onChange={(e) => set("internship", e.target.value)}
                placeholder="Терапия"
                className={inp}
              />,
            )}
            {field(
              "Ординатура",
              <input
                value={d.residency}
                onChange={(e) => set("residency", e.target.value)}
                placeholder="Кардиология"
                className={inp}
              />,
            )}
            {field(
              "Специализация по диплому",
              <input
                value={d.diplomaSpecialty}
                onChange={(e) => set("diplomaSpecialty", e.target.value)}
                placeholder="Лечебное дело"
                className={inp}
              />,
            )}
            {field(
              "Дополнительное образование",
              <input
                value={d.additionalEducation.join(", ")}
                onChange={(e) =>
                  set("additionalEducation", csv(e.target.value))
                }
                placeholder="Курсы повышения квалификации"
                className={inp}
              />,
            )}
          </div>
        ) : (
          <div>
            {view("ВУЗ", d.university)}
            {view("Год окончания", d.graduationYear)}
            {view("Интернатура", d.internship)}
            {view("Ординатура", d.residency)}
            {view("Специализация по диплому", d.diplomaSpecialty)}
            <div className="py-3">
              <p className="text-muted text-sm mb-1">
                Дополнительное образование
              </p>
              {d.additionalEducation.filter(Boolean).length === 0 ? (
                <p className="text-foreground font-medium text-base">—</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {d.additionalEducation.filter(Boolean).map((e, i) => (
                    <p
                      key={i}
                      className="text-foreground font-medium text-base flex gap-2"
                    >
                      <span className="text-primary">—</span> {e}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Сертификаты и документы ─────────────────────────── */}
      <Section title="Сертификаты и документы">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-muted text-sm mb-2">Сертификаты</p>
            <div className="flex flex-wrap gap-3">
              {d.certificates.map((cert, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-20">
                  <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center text-muted">
                    <FileIcon />
                  </div>
                  <span className="text-xs text-secondary truncate w-full text-center">
                    {cert}
                  </span>
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white shrink-0"
                  aria-label="Добавить документ"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
              {!isEditing && d.certificates.length === 0 && (
                <p className="text-foreground font-medium text-base">—</p>
              )}
            </div>
          </div>

          {isEditing
            ? field(
                "Номер лицензии",
                <input
                  value={d.licenseNumber}
                  onChange={(e) => set("licenseNumber", e.target.value)}
                  placeholder="ЛИЦ-123456"
                  className={inp}
                />,
              )
            : view("Номер лицензии", d.licenseNumber)}
        </div>
      </Section>
    </DoctorPageLayout>
  );
};
