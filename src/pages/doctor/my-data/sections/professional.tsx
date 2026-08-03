"use client";

import { FC, useState } from "react";

import {
  DoctorMyDataTabs,
  DoctorPageLayout,
  useMyDataTabs,
} from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView, formStyles } from "@/widgets/doctor/layout";

import {
  resolveSpecializationIds,
  useSpecializationOptions,
  useSpecializations,
} from "@/entities/specialization";

import { CheckIcon } from "@/shared/assets/icons";
import {
  Button,
  CancelEditButton,
  ConfirmDialog,
  Dropdown,
  Input,
} from "@/shared/ui";

type D = {
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
  equipment: string;
  patientConditions: string;
  paymentMethods: string;
};

const { fieldList, formGrid } = formStyles;

// "УЗИ, ЭКГ" → ["УЗИ", "ЭКГ"]
const csv = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const DoctorProfessionalInfoSection: FC = () => {
  const { profile, isLoading, isSaving, saveProfile, rawProfile } =
    useDoctorCabinet();
  const { setActive } = useMyDataTabs();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [d, setD] = useState<D>({
    specialty: "",
    additionalSpecialty: "",
    experienceYears: "",
    currentPosition: "",
    workplace: "",
    qualification: "",
    scientificDegree: "",
    equipment: "",
    patientConditions: "",
    paymentMethods: "",
  });

  // Синхронизация формы с профилем прямо в рендере (рекомендованный паттерн
  // «adjust state during render» вместо setState в эффекте).
  // Инициализируем трекер именно null, а не текущим profile: макет кабинета
  // (DoctorPageLayoutSkeleton) держит тот же запрос смонтированным, поэтому при
  // переходе между вкладками страница монтируется, когда профиль уже в кеше.
  // С useState(profile) первый же рендер записывал его в трекер, условие ниже
  // не срабатывало никогда — и форма оставалась пустой.
  const [syncedProfile, setSyncedProfile] = useState<typeof profile>(null);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setD({
      specialty: profile.specialty,
      additionalSpecialty: profile.additionalSpecialty,
      experienceYears: profile.experienceYears,
      currentPosition: profile.currentPosition,
      workplace: profile.workplace,
      qualification: profile.qualification,
      scientificDegree: profile.scientificDegree,
      equipment: profile.equipment,
      patientConditions: profile.patientConditions,
      paymentMethods: profile.paymentMethods,
    });
  }

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  // Специализации — из справочника бэка. Dropdown работает по названию (по
  // нему же ищут фильтры врачей), а сохраняется профиль по id — резолвим
  // название обратно в id перед отправкой (см. resolveSpecializationIds).
  const { options: specializationOptions, isLoading: isSpecsLoading } =
    useSpecializationOptions();
  const { data: specializationList = [] } = useSpecializations();
  const specializationPlaceholder = isSpecsLoading
    ? "Загружаем список..."
    : "Выберите";

  const handleSave = async () => {
    // Должность/место/категория/степень отдельных полей на бэке НЕ имеют —
    // храним их в первой записи work_experience (бэк сохраняет произвольные
    // ключи как JSON, проверено прямыми запросами). Сохраняем существующие
    // from/to, если они уже были.
    const existing =
      (
        rawProfile as unknown as {
          work_experience?: Record<string, unknown>[];
        } | null
      )?.work_experience?.[0] ?? {};

    // API принимает на запись только id (см. resolveSpecializationIds) —
    // Dropdown хранит название, поэтому резолвим перед отправкой.
    const { ids: primaryIds } = resolveSpecializationIds(
      d.specialty ? [d.specialty] : [],
      specializationList,
    );
    const { ids: narrowIds } = resolveSpecializationIds(
      d.additionalSpecialty ? [d.additionalSpecialty] : [],
      specializationList,
    );

    await saveProfile({
      primary_specialization_ids: primaryIds,
      narrow_specialization_ids: narrowIds,
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
      equipment: csv(d.equipment),
      patient_conditions: csv(d.patientConditions),
      payment_methods: csv(d.paymentMethods),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (profile) {
      setD({
        specialty: profile.specialty,
        additionalSpecialty: profile.additionalSpecialty,
        experienceYears: profile.experienceYears,
        currentPosition: profile.currentPosition,
        workplace: profile.workplace,
        qualification: profile.qualification,
        scientificDegree: profile.scientificDegree,
        equipment: profile.equipment,
        patientConditions: profile.patientConditions,
        paymentMethods: profile.paymentMethods,
      });
    }
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Профессиональные данные";

  if (isLoading) {
    return (
      <DoctorPageLayout
        title="Профессиональные данные"
        onBack={() => setActive(null)}
      >
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
      onEditToggle={
        isEditing ? () => setShowSaveConfirm(true) : () => setIsEditing(true)
      }
      onBack={isEditing ? handleCancel : () => setActive(null)}
    >
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          {isEditing && (
            <CancelEditButton onClick={handleCancel} disabled={isSaving} />
          )}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={
              isEditing
                ? () => setShowSaveConfirm(true)
                : () => setIsEditing(true)
            }
            disabled={isSaving}
          >
            {isSaving
              ? "Сохранение..."
              : isEditing
                ? "Сохранить"
                : "Редактировать"}
          </Button>
        </div>
      </div>

      <DoctorMyDataTabs />

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8">
        <div className={isEditing ? formGrid : fieldList}>
          <div>
            {isEditing ? (
              <Dropdown
                label="Специализация"
                placeholder={specializationPlaceholder}
                options={specializationOptions}
                searchable
                value={d.specialty}
                onChange={(v) => set("specialty", v)}
              />
            ) : (
              <FieldView label="Специализация" value={d.specialty} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Dropdown
                label="Дополнительная специализация"
                placeholder={specializationPlaceholder}
                options={specializationOptions}
                searchable
                value={d.additionalSpecialty}
                onChange={(v) => set("additionalSpecialty", v)}
              />
            ) : (
              <FieldView
                label="Дополнительная специализация"
                value={d.additionalSpecialty}
              />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Стаж работы, лет"
                type="number"
                min="0"
                value={d.experienceYears}
                onChange={(e) => set("experienceYears", e.target.value)}
                placeholder="0"
              />
            ) : (
              <FieldView label="Стаж работы, лет" value={d.experienceYears} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Текущая должность"
                value={d.currentPosition}
                onChange={(e) => set("currentPosition", e.target.value)}
                placeholder="Введите должность"
              />
            ) : (
              <FieldView label="Текущая должность" value={d.currentPosition} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Место работы (клиника)"
                value={d.workplace}
                onChange={(e) => set("workplace", e.target.value)}
                placeholder="Введите название клиники"
              />
            ) : (
              <FieldView label="Место работы (клиника)" value={d.workplace} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Dropdown
                label="Категория / Квалификация"
                placeholder="Выберите"
                options={["Высшая", "Первая", "Вторая", "Без категории"].map(
                  (o) => ({ label: o, value: o }),
                )}
                value={d.qualification}
                onChange={(v) => set("qualification", v)}
              />
            ) : (
              <FieldView
                label="Категория / Квалификация"
                value={d.qualification}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            {isEditing ? (
              <Input
                label="Научная степень"
                value={d.scientificDegree}
                onChange={(e) => set("scientificDegree", e.target.value)}
                placeholder="Введите степень"
              />
            ) : (
              <FieldView label="Научная степень" value={d.scientificDegree} />
            )}
          </div>
          <div className="lg:col-span-2">
            {isEditing ? (
              <Input
                label="Оборудование (через запятую)"
                value={d.equipment}
                onChange={(e) => set("equipment", e.target.value)}
                placeholder="УЗИ, ЭКГ, Рентген"
              />
            ) : (
              <FieldView label="Оборудование" value={d.equipment} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Условия приёма (через запятую)"
                value={d.patientConditions}
                onChange={(e) => set("patientConditions", e.target.value)}
                placeholder="Приём детей, Приём на дому"
              />
            ) : (
              <FieldView label="Условия приёма" value={d.patientConditions} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Способы оплаты (через запятую)"
                value={d.paymentMethods}
                onChange={(e) => set("paymentMethods", e.target.value)}
                placeholder="Наличные, Карта, Перевод"
              />
            ) : (
              <FieldView label="Способы оплаты" value={d.paymentMethods} />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные профиля будут сохранены"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
      />
    </DoctorPageLayout>
  );
};
