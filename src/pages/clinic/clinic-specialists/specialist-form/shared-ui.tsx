"use client";

import { FC, useRef } from "react";

import { useSpecializationOptions } from "@/entities/specialization";

import type { ClinicDocument } from "@/shared/api";
import { UserCircleIcon } from "@/shared/assets/icons";
import { MAX_DOCUMENT_MB, isFileSizeAllowed } from "@/shared/lib/files";
import {
  Button,
  DateField,
  Dropdown,
  ImageWithFallback,
  Input,
  PhoneInput,
  Textarea,
} from "@/shared/ui";
import type { DropdownOption } from "@/shared/ui/dropdown";

import type { SpecialistFormState } from "./model";

export const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

const withSelectedSpecialization = (
  options: DropdownOption[],
  selected: string,
): DropdownOption[] => {
  if (!selected || options.some((option) => option.value === selected)) {
    return options;
  }

  // Не прячем уже сохранённое значение, если оно больше не входит в scope
  // опубликованных врачей. Иначе открытие и сохранение карточки могло бы его
  // молча удалить.
  return [...options, { label: selected, value: selected }];
};

// Строка «label / значение» с разделителем — тот же паттерн, что в остальных
// unified-профилях (доктор «Мои данные», клиника «Моя клиника»).
export const FieldRow: FC<{ children: React.ReactNode; label: string }> = ({
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

export const SectionCard: FC<{ children: React.ReactNode; title: string }> = ({
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
  // Только для BasicInfoSection при создании — формат почты реально проверяет
  // бэк (уникальность), а не только клиент, но явный формат стоит подсветить
  // сразу.
  emailError?: string;
  isEditing: boolean;
  // Специалист создаётся впервые: показываем поле пароля и подсказку про
  // отчество. Все остальные поля бэк принимает и при создании, и при правке.
  isNew?: boolean;
  set: <K extends keyof SpecialistFormState>(
    key: K,
    value: SpecialistFormState[K],
  ) => void;
};

export const BasicInfoSection: FC<SectionProps> = ({
  d,
  set,
  isEditing,
  isNew = false,
  emailError,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Превью рисуем из data-URL, а на бэк уходит сам File (см. photoFile).
    set("photoFile", file);
    const reader = new FileReader();
    reader.onloadend = () => set("photoPreview", reader.result as string);
    reader.readAsDataURL(file);
  };

  const photo = (
    <div className="w-20 h-20 rounded-full overflow-hidden bg-surface flex items-center justify-center shrink-0">
      {d.photoPreview ? (
        <ImageWithFallback
          src={d.photoPreview}
          alt={d.fullName}
          width={80}
          height={80}
          unoptimized={d.photoPreview.startsWith("data:")}
          className="w-full h-full object-cover"
          fallback={<UserCircleIcon className="size-10 text-dim" />}
        />
      ) : (
        <UserCircleIcon className="size-10 text-dim" />
      )}
    </div>
  );

  if (!isEditing) {
    return (
      <div>
        <FieldRow label="ФИО">{d.fullName}</FieldRow>
        <FieldRow label="Пол">
          {GENDER_OPTIONS.find((g) => g.value === d.gender)?.label ?? d.gender}
        </FieldRow>
        <FieldRow label="Дата рождения">{d.birthDate}</FieldRow>
        <FieldRow label="Город">{d.city}</FieldRow>
        <FieldRow label="Языки общения">{d.languages}</FieldRow>
        <FieldRow label="Телефон">{d.phone}</FieldRow>
        <FieldRow label="Почта">{d.email}</FieldRow>
        <div className="pt-3">
          <div className="text-muted text-sm mb-2">Фото</div>
          {photo}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="ФИО"
        value={d.fullName}
        onChange={(e) => set("fullName", e.target.value)}
        placeholder="Иванова Асель Бековна"
        hint={
          isNew
            ? "Фамилия Имя Отчество — отчество не сохранится, при создании врача бэк его не принимает"
            : undefined
        }
      />

      <Dropdown
        label="Пол"
        placeholder="Выберите"
        options={GENDER_OPTIONS}
        value={d.gender}
        onChange={(v) => set("gender", v)}
      />

      <DateField
        label="Дата рождения"
        value={d.birthDate}
        onChange={(v) => set("birthDate", v)}
        min="01.01.1920"
        maxToday
      />

      <Input
        label="Город"
        value={d.city}
        onChange={(e) => set("city", e.target.value)}
        placeholder="Введите город"
      />

      <Input
        label="Языки общения"
        value={d.languages}
        onChange={(e) => set("languages", e.target.value)}
        placeholder="Русский, Английский"
        hint="Через запятую"
      />

      <PhoneInput
        label="Телефон"
        value={d.phone}
        onChange={(v) => set("phone", v)}
      />

      <Input
        label="Почта"
        type="email"
        value={d.email}
        onChange={(e) => set("email", e.target.value)}
        placeholder="Введите вашу почту"
        error={emailError}
        // Почту меняет только сам врач через /api/doctor/profile/ — у клиники
        // это поле только на чтение (кроме момента создания аккаунта).
        disabled={!isNew}
      />

      {isNew && (
        <Input
          label="Пароль"
          value={d.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="Doctor123!"
          hint="Необязательно. Если оставить пустым — бэк поставит Doctor123!"
        />
      )}

      <div>
        <label className="block text-foreground text-sm font-medium mb-1.5">
          Фото
        </label>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />
        <div className="flex items-center gap-4">
          {photo}
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
  // Специализация — из справочника бэка, а не свободный текст: по этому же
  // значению врача потом ищут фильтры, опечатка выкидывала бы его из выдачи.
  const { options: specializationOptions, isLoading: isSpecsLoading } =
    useSpecializationOptions("doctor");
  const specializationPlaceholder = isSpecsLoading
    ? "Загружаем список..."
    : "Выберите из списка";

  if (!isEditing) {
    return (
      <div>
        <FieldRow label="Специализация">{d.specialization}</FieldRow>
        <FieldRow label="Дополнительная специализация">
          {d.additionalSpecialization}
        </FieldRow>
        <FieldRow label="Стаж работы (лет)">{d.experienceYears}</FieldRow>
        <FieldRow label="Текущая должность">{d.position}</FieldRow>
        <FieldRow label="Категория/Квалификация">{d.qualification}</FieldRow>
        <FieldRow label="Научная степень">{d.degree}</FieldRow>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Dropdown
        label="Специализация"
        placeholder={specializationPlaceholder}
        options={withSelectedSpecialization(
          specializationOptions,
          d.specialization,
        )}
        searchable
        value={d.specialization}
        onChange={(v) => set("specialization", v)}
      />
      <Dropdown
        label="Дополнительная специализация"
        placeholder={specializationPlaceholder}
        options={withSelectedSpecialization(
          specializationOptions,
          d.additionalSpecialization,
        )}
        searchable
        value={d.additionalSpecialization}
        onChange={(v) => set("additionalSpecialization", v)}
      />
      <Input
        label="Стаж работы (лет)"
        type="number"
        min="0"
        value={d.experienceYears}
        onChange={(e) => set("experienceYears", e.target.value)}
        placeholder="0"
      />
      <Input
        label="Текущая должность"
        value={d.position}
        onChange={(e) => set("position", e.target.value)}
        placeholder="Введите должность"
      />
      <Input
        label="Категория/Квалификация"
        value={d.qualification}
        onChange={(e) => set("qualification", e.target.value)}
        placeholder="Введите категорию/квалификацию"
      />
      <Input
        label="Научная степень"
        value={d.degree}
        onChange={(e) => set("degree", e.target.value)}
        placeholder="Введите научную степень"
      />
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
      <Input
        label="ВУЗ"
        value={d.university}
        onChange={(e) => set("university", e.target.value)}
        placeholder="Введите название"
      />
      <Input
        label="Год окончания"
        value={d.graduationYear}
        onChange={(e) => set("graduationYear", e.target.value)}
        placeholder="ГГГГ"
      />
      <Input
        label="Интернатура"
        value={d.internship}
        onChange={(e) => set("internship", e.target.value)}
        placeholder="Специальность"
      />
      <Input
        label="Ординатура"
        value={d.residency}
        onChange={(e) => set("residency", e.target.value)}
        placeholder="Специальность"
      />
      <Input
        label="Специализация по диплому"
        value={d.diplomaSpecialty}
        onChange={(e) => set("diplomaSpecialty", e.target.value)}
        placeholder="Введите специализацию по диплому"
      />
      <Textarea
        label="Дополнительное образование"
        value={d.additionalEducation}
        onChange={(e) => set("additionalEducation", e.target.value)}
        placeholder="Курсы повышения квалификации, сертификаты..."
        rows={3}
        hint="По одному курсу в строке"
      />
    </div>
  );
};

type CertificatesProps = SectionProps & {
  // Сертификаты живут отдельной ручкой (/api/clinic/doctors/{id}/documents/) и
  // грузятся сразу, мимо «Сохранить» — как и в кабинете самого врача.
  documents?: ClinicDocument[];
  isUploading?: boolean;
  onDelete?: (id: number) => Promise<unknown>;
  onUpload?: (file: File) => Promise<unknown>;
};

export const CertificatesSection: FC<CertificatesProps> = ({
  d,
  set,
  isEditing,
  isNew = false,
  documents = [],
  onUpload,
  onDelete,
  isUploading = false,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !isFileSizeAllowed(file, MAX_DOCUMENT_MB)) return;
    await onUpload?.(file);
  };

  const certificates = (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-muted text-sm">Сертификаты</div>
        {isEditing && onUpload && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="text"
              size="xs"
              className="text-primary"
              onClick={() => fileRef.current?.click()}
              loading={isUploading}
            >
              + Добавить документ
            </Button>
          </>
        )}
      </div>

      {/* Загрузка возможна только у существующего врача: файл уходит на
          /api/clinic/doctors/{id}/documents/, а id появляется после создания. */}
      {isNew ? (
        <p className="text-muted text-sm">
          Сертификаты можно будет загрузить после создания специалиста.
        </p>
      ) : documents.length === 0 ? (
        <p className="text-dim text-sm">Нет загруженных документов</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-surface"
            >
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Открыть документ"
                className="block w-full h-full"
              >
                <ImageWithFallback
                  src={doc.url}
                  alt="Сертификат"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center text-dim">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M4 3h9l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13 3v3h3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  }
                />
              </a>
              {isEditing && onDelete && (
                <button
                  onClick={() => void onDelete(doc.id)}
                  aria-label="Удалить документ"
                  className="absolute top-0 right-0 z-10 w-1/2 aspect-square bg-primary flex items-center justify-center"
                >
                  <svg className="w-1/2 h-1/2" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-4">
        {certificates}
        <FieldRow label="Номер лицензии">{d.licenseNumber}</FieldRow>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {certificates}
      <Input
        label="Номер лицензии"
        value={d.licenseNumber}
        onChange={(e) => set("licenseNumber", e.target.value)}
        placeholder="ЛИЦ-XXXXXX"
      />
    </div>
  );
};
