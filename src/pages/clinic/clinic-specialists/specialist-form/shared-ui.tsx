"use client";

import { FC, useRef } from "react";

import { useSpecializationOptions } from "@/entities/specialization";

import { UserCircleIcon } from "@/shared/assets/icons";
import {
  Button,
  Dropdown,
  ImageWithFallback,
  Input,
  PhoneInput,
  Textarea,
} from "@/shared/ui";

import type { SpecialistFormState } from "./model";

export const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

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

// У бэка нет ни поля, ни способа сохранить это значение — ни при создании
// врача клиникой (POST /api/clinic/doctors/ принимает только first_name/
// last_name/email/phone/password), ни при редактировании уже прикреплённого
// (GET/PUT /api/clinic/doctors/{id}/ не существует вообще, только DELETE).
// Вместо рабочего на вид поля, которое молча ничего не сохранит — прямо
// показываем, что это не подключено, а не даём false sense of сохранности.
const NOT_STORED_VALUE = "В беке такого нет. Но вот вам моковые данные";

const NotStoredField: FC<{ label: string; isEditing: boolean }> = ({
  label,
  isEditing,
}) =>
  isEditing ? (
    <div>
      <label className="block text-foreground text-sm font-medium mb-1.5">
        {label}
      </label>
      <div className="w-full rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted">
        {NOT_STORED_VALUE}
      </div>
    </div>
  ) : (
    <FieldRow label={label}>
      <span className="font-normal text-muted">{NOT_STORED_VALUE}</span>
    </FieldRow>
  );

type SectionProps = {
  d: SpecialistFormState;
  set: <K extends keyof SpecialistFormState>(
    key: K,
    value: SpecialistFormState[K],
  ) => void;
  isEditing: boolean;
  // Специалист создаётся впервые — id на бэке ещё нет, поэтому недоступны и
  // те поля, что при просмотре УЖЕ прикреплённого врача показывают настоящие
  // данные из GET /api/doctors/{id}/ (город, специализация, стаж и т.д.).
  isNew?: boolean;
  // Только для BasicInfoSection при создании — формат почты реально проверяет
  // бэк (уникальность), а не только клиент, но явный формат стоит подсветить
  // сразу.
  emailError?: string;
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
    const reader = new FileReader();
    reader.onloadend = () => set("photoPreview", reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!isEditing) {
    return (
      <div>
        <FieldRow label="ФИО">{d.fullName}</FieldRow>
        <NotStoredField label="Пол" isEditing={false} />
        <NotStoredField label="Дата рождения" isEditing={false} />
        {isNew ? (
          <NotStoredField label="Город" isEditing={false} />
        ) : (
          <FieldRow label="Город">{d.city}</FieldRow>
        )}
        {isNew ? (
          <NotStoredField label="Язык общения" isEditing={false} />
        ) : (
          <FieldRow label="Язык общения">{d.languages}</FieldRow>
        )}
        <FieldRow label="Телефон">{d.phone}</FieldRow>
        <FieldRow label="Почта">{d.email}</FieldRow>
        <div className="pt-3">
          <div className="text-muted text-sm mb-2">Фото</div>
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface flex items-center justify-center">
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
            ? "Фамилия Имя Отчество — отчество не сохранится, у бэка нет для него поля"
            : undefined
        }
      />

      <NotStoredField label="Пол" isEditing />
      <NotStoredField label="Дата рождения" isEditing />

      {isNew ? (
        <NotStoredField label="Город" isEditing />
      ) : (
        <Input
          label="Город"
          value={d.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Выберите из списка"
        />
      )}

      {isNew ? (
        <NotStoredField label="Языки общения" isEditing />
      ) : (
        <Input
          label="Языки общения"
          value={d.languages}
          onChange={(e) => set("languages", e.target.value)}
          placeholder="Выберите из списка"
        />
      )}

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

      {isNew ? (
        <NotStoredField label="Фото" isEditing />
      ) : (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
            >
              + Добавить фото
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ProfessionalSection: FC<SectionProps> = ({
  d,
  set,
  isEditing,
  isNew = false,
}) => {
  // Специализация — из справочника бэка, а не свободный текст: по этому же
  // значению врача потом ищут фильтры, опечатка выкидывала бы его из выдачи.
  const { options: specializationOptions, isLoading: isSpecsLoading } =
    useSpecializationOptions();
  const specializationPlaceholder = isSpecsLoading
    ? "Загружаем список..."
    : "Выберите из списка";

  if (!isEditing) {
    return (
      <div>
        {isNew ? (
          <NotStoredField label="Специализация" isEditing={false} />
        ) : (
          <FieldRow label="Специализация">{d.specialization}</FieldRow>
        )}
        <NotStoredField
          label="Дополнительная специализация"
          isEditing={false}
        />
        {isNew ? (
          <NotStoredField label="Стаж работы (лет)" isEditing={false} />
        ) : (
          <FieldRow label="Стаж работы (лет)">{d.experienceYears}</FieldRow>
        )}
        {isNew ? (
          <NotStoredField label="Текущая должность" isEditing={false} />
        ) : (
          <FieldRow label="Текущая должность">{d.position}</FieldRow>
        )}
        {isNew ? (
          <NotStoredField label="Место работы (клиника)" isEditing={false} />
        ) : (
          <FieldRow label="Место работы (клиника)">{d.workplace}</FieldRow>
        )}
        {isNew ? (
          <NotStoredField label="Категория/Квалификация" isEditing={false} />
        ) : (
          <FieldRow label="Категория/Квалификация">{d.qualification}</FieldRow>
        )}
        {isNew ? (
          <NotStoredField label="Научная степень" isEditing={false} />
        ) : (
          <FieldRow label="Научная степень">{d.degree}</FieldRow>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isNew ? (
        <NotStoredField label="Специализация" isEditing />
      ) : (
        <Dropdown
          label="Специализация"
          placeholder={specializationPlaceholder}
          options={specializationOptions}
          searchable
          value={d.specialization}
          onChange={(v) => set("specialization", v)}
        />
      )}
      <NotStoredField label="Дополнительная специализация" isEditing />
      {isNew ? (
        <NotStoredField label="Стаж работы (лет)" isEditing />
      ) : (
        <Input
          label="Стаж работы (лет)"
          type="number"
          value={d.experienceYears}
          onChange={(e) => set("experienceYears", e.target.value)}
          placeholder="0"
        />
      )}
      {isNew ? (
        <NotStoredField label="Текущая должность" isEditing />
      ) : (
        <Input
          label="Текущая должность"
          value={d.position}
          onChange={(e) => set("position", e.target.value)}
          placeholder="Введите должность"
        />
      )}
      {isNew ? (
        <NotStoredField label="Место работы (клиника)" isEditing />
      ) : (
        <Input
          label="Место работы (клиника)"
          value={d.workplace}
          onChange={(e) => set("workplace", e.target.value)}
          placeholder="Введите название клиники"
        />
      )}
      {isNew ? (
        <NotStoredField label="Категория/Квалификация" isEditing />
      ) : (
        <Input
          label="Категория/Квалификация"
          value={d.qualification}
          onChange={(e) => set("qualification", e.target.value)}
          placeholder="Введите категорию/квалификацию"
        />
      )}
      {isNew ? (
        <NotStoredField label="Научная степень" isEditing />
      ) : (
        <Input
          label="Научная степень"
          value={d.degree}
          onChange={(e) => set("degree", e.target.value)}
          placeholder="Введите научную степень"
        />
      )}
    </div>
  );
};

export const EducationSection: FC<SectionProps> = ({
  d,
  set,
  isEditing,
  isNew = false,
}) => {
  if (!isEditing) {
    return (
      <div>
        {isNew ? (
          <NotStoredField label="ВУЗ" isEditing={false} />
        ) : (
          <FieldRow label="ВУЗ">{d.university}</FieldRow>
        )}
        {isNew ? (
          <NotStoredField label="Год окончания" isEditing={false} />
        ) : (
          <FieldRow label="Год окончания">{d.graduationYear}</FieldRow>
        )}
        <NotStoredField label="Интернатура" isEditing={false} />
        <NotStoredField label="Ординатура" isEditing={false} />
        {isNew ? (
          <NotStoredField label="Специализация по диплому" isEditing={false} />
        ) : (
          <FieldRow label="Специализация по диплому">
            {d.diplomaSpecialty}
          </FieldRow>
        )}
        {isNew ? (
          <NotStoredField
            label="Дополнительное образование"
            isEditing={false}
          />
        ) : (
          <FieldRow label="Дополнительное образование">
            {d.additionalEducation}
          </FieldRow>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isNew ? (
        <NotStoredField label="ВУЗ" isEditing />
      ) : (
        <Input
          label="ВУЗ"
          value={d.university}
          onChange={(e) => set("university", e.target.value)}
          placeholder="Введите название"
        />
      )}
      {isNew ? (
        <NotStoredField label="Год окончания" isEditing />
      ) : (
        <Input
          label="Год окончания"
          value={d.graduationYear}
          onChange={(e) => set("graduationYear", e.target.value)}
          placeholder="ГГГГ"
        />
      )}
      <NotStoredField label="Интернатура" isEditing />
      <NotStoredField label="Ординатура" isEditing />
      {isNew ? (
        <NotStoredField label="Специализация по диплому" isEditing />
      ) : (
        <Input
          label="Специализация по диплому"
          value={d.diplomaSpecialty}
          onChange={(e) => set("diplomaSpecialty", e.target.value)}
          placeholder="Введите специализацию по диплому"
        />
      )}
      {isNew ? (
        <NotStoredField label="Дополнительное образование" isEditing />
      ) : (
        <Textarea
          label="Дополнительное образование"
          value={d.additionalEducation}
          onChange={(e) => set("additionalEducation", e.target.value)}
          placeholder="Курсы повышения квалификации, сертификаты..."
          rows={3}
        />
      )}
    </div>
  );
};

export const CertificatesSection: FC<SectionProps> = ({ isEditing }) => {
  if (!isEditing) {
    return (
      <div>
        <NotStoredField label="Сертификаты" isEditing={false} />
        <NotStoredField label="Лицензия" isEditing={false} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NotStoredField label="Сертификаты" isEditing />
      <NotStoredField label="Лицензия" isEditing />
    </div>
  );
};
