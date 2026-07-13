"use client";

import { FC, useRef } from "react";

import Image from "next/image";

import { UserCircleIcon } from "@/shared/assets/icons";
import { Button, PhoneInput } from "@/shared/ui";

import type { SpecialistFormState } from "./model";

export const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

export const inp =
  "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors bg-white";
export const lbl = "block text-foreground text-sm font-medium mb-1.5";

// Строка «label / значение» с разделителем — тот же паттерн, что в остальных
// unified-профилях (доктор «Мои данные», клиника «Моя клиника»).
export const FieldRow: FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="py-3 border-b border-background last:border-b-0">
    <div className="text-muted text-sm mb-1">{label}</div>
    <div className="text-foreground font-medium text-base">
      {children || "—"}
    </div>
  </div>
);

export const SectionCard: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-3xl p-5 lg:p-6 border border-border mb-6">
    <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

type SectionProps = {
  d: SpecialistFormState;
  set: <K extends keyof SpecialistFormState>(
    key: K,
    value: SpecialistFormState[K],
  ) => void;
  isEditing: boolean;
};

export const BasicInfoSection: FC<SectionProps> = ({ d, set, isEditing }) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photoPreview", reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!isEditing) {
    return (
      <div>
        <FieldRow label="ФИО">{d.fullName}</FieldRow>
        <FieldRow label="Пол">
          {GENDER_OPTIONS.find((g) => g.value === d.gender)?.label}
        </FieldRow>
        <FieldRow label="Дата рождения">{d.birthDate}</FieldRow>
        <FieldRow label="Город">{d.city}</FieldRow>
        <FieldRow label="Язык общения">{d.languages}</FieldRow>
        <FieldRow label="Телефон">{d.phone}</FieldRow>
        <FieldRow label="Почта">{d.email}</FieldRow>
        <div className="pt-3">
          <div className="text-muted text-sm mb-2">Фото</div>
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface flex items-center justify-center">
            {d.photoPreview ? (
              <Image
                src={d.photoPreview}
                alt={d.fullName}
                width={80}
                height={80}
                unoptimized={d.photoPreview.startsWith("data:")}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="size-10 text-dim" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={lbl}>ФИО</label>
        <input
          value={d.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Введите полное ФИО"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Пол</label>
        <div className="flex gap-3">
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
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={lbl}>Дата рождения</label>
        <input
          value={d.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          placeholder="ДД.ММ.ГГГГ"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Город</label>
        <input
          value={d.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Выберите из списка"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Языки общения</label>
        <input
          value={d.languages}
          onChange={(e) => set("languages", e.target.value)}
          placeholder="Выберите из списка"
          className={inp}
        />
      </div>

      <PhoneInput
        label="Телефон"
        value={d.phone}
        onChange={(v) => set("phone", v)}
      />

      <div>
        <label className={lbl}>Почта</label>
        <input
          type="email"
          value={d.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="Введите вашу почту"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Фото</label>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface flex items-center justify-center shrink-0">
            {d.photoPreview ? (
              <Image
                src={d.photoPreview}
                alt={d.fullName}
                width={80}
                height={80}
                unoptimized={d.photoPreview.startsWith("data:")}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="size-10 text-dim" />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
          >
            + Добавить фото
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProfessionalSection: FC<SectionProps> = ({
  d,
  set,
  isEditing,
}) => {
  if (!isEditing) {
    return (
      <div>
        <FieldRow label="Специализация">{d.specialization}</FieldRow>
        <FieldRow label="Дополнительная специализация">
          {d.additionalSpecialization}
        </FieldRow>
        <FieldRow label="Стаж работы (лет)">{d.experienceYears}</FieldRow>
        <FieldRow label="Текущая должность">{d.position}</FieldRow>
        <FieldRow label="Место работы (клиника)">{d.workplace}</FieldRow>
        <FieldRow label="Категория/Квалификация">{d.qualification}</FieldRow>
        <FieldRow label="Научная степень">{d.degree}</FieldRow>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={lbl}>Специализация</label>
        <input
          value={d.specialization}
          onChange={(e) => set("specialization", e.target.value)}
          placeholder="Выберите из списка"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Дополнительная специализация</label>
        <input
          value={d.additionalSpecialization}
          onChange={(e) => set("additionalSpecialization", e.target.value)}
          placeholder="Выберите из списка"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Стаж работы (лет)</label>
        <input
          type="number"
          value={d.experienceYears}
          onChange={(e) => set("experienceYears", e.target.value)}
          placeholder="0"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Текущая должность</label>
        <input
          value={d.position}
          onChange={(e) => set("position", e.target.value)}
          placeholder="Введите должность"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Место работы (клиника)</label>
        <input
          value={d.workplace}
          onChange={(e) => set("workplace", e.target.value)}
          placeholder="Введите название клиники"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Категория/Квалификация</label>
        <input
          value={d.qualification}
          onChange={(e) => set("qualification", e.target.value)}
          placeholder="Введите категорию/квалификацию"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Научная степень</label>
        <input
          value={d.degree}
          onChange={(e) => set("degree", e.target.value)}
          placeholder="Введите научную степень"
          className={inp}
        />
      </div>
    </div>
  );
};

export const EducationSection: FC<SectionProps> = ({ d, set, isEditing }) => {
  if (!isEditing) {
    return (
      <div>
        <FieldRow label="ВУЗ">{d.university}</FieldRow>
        <FieldRow label="Год окончания">{d.graduationYear}</FieldRow>
        <FieldRow label="Интернатура">{d.internship}</FieldRow>
        <FieldRow label="Ординатура">{d.residency}</FieldRow>
        <FieldRow label="Специализация по диплому">
          {d.diplomaSpecialty}
        </FieldRow>
        <FieldRow label="Дополнительное образование">
          {d.additionalEducation}
        </FieldRow>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={lbl}>ВУЗ</label>
        <input
          value={d.university}
          onChange={(e) => set("university", e.target.value)}
          placeholder="Введите название"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Год окончания</label>
        <input
          value={d.graduationYear}
          onChange={(e) => set("graduationYear", e.target.value)}
          placeholder="ГГГГ"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Интернатура</label>
        <input
          value={d.internship}
          onChange={(e) => set("internship", e.target.value)}
          placeholder="Введите интернатуру"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Ординатура</label>
        <input
          value={d.residency}
          onChange={(e) => set("residency", e.target.value)}
          placeholder="Введите ординатуру"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Специализация по диплому</label>
        <input
          value={d.diplomaSpecialty}
          onChange={(e) => set("diplomaSpecialty", e.target.value)}
          placeholder="Введите специализацию по диплому"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Дополнительное образование</label>
        <textarea
          value={d.additionalEducation}
          onChange={(e) => set("additionalEducation", e.target.value)}
          placeholder="Курсы повышения квалификации, сертификаты..."
          rows={3}
          className={`${inp} resize-none`}
        />
      </div>
    </div>
  );
};

export const CertificatesSection: FC<SectionProps> = ({
  d,
  set,
  isEditing,
}) => {
  if (!isEditing) {
    return (
      <div>
        <FieldRow label="Сертификаты">—</FieldRow>
        <FieldRow label="Лицензия">{d.licenseNumber}</FieldRow>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={lbl}>Сертификаты</label>
        <button
          type="button"
          className="w-full py-6 rounded-2xl border border-dashed border-border flex items-center justify-center gap-2 text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
        >
          + Загрузить документы
        </button>
      </div>
      <div>
        <label className={lbl}>Лицензия</label>
        <input
          value={d.licenseNumber}
          onChange={(e) => set("licenseNumber", e.target.value)}
          placeholder="Введите номер лицензии"
          className={inp}
        />
      </div>
    </div>
  );
};
