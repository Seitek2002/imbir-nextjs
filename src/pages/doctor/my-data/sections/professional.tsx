"use client";

import { FC, useState } from "react";

import {
  CheckboxGroup,
  DoctorPageLayout,
  type DoctorProfileData,
  useMyDataTabs,
} from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView, formStyles } from "@/widgets/doctor/layout";

import {
  resolveSpecializationIds,
  useSpecializationOptions,
  useSpecializations,
} from "@/entities/specialization";

import {
  getConditions,
  getEquipment,
  getPaymentMethods,
  referenceKeys,
} from "@/shared/api";
import { CheckIcon } from "@/shared/assets/icons";
import { useReferenceValues } from "@/shared/lib/useReference";
import {
  Button,
  CancelEditButton,
  Checkbox,
  ConfirmDialog,
  Dropdown,
  Input,
} from "@/shared/ui";

// Те же дефолты, что у клиники (pages/clinic/clinic-profile/sections/
// equipment/ui.tsx) — используются только пока справочник бэка не пришёл.
const DEFAULT_EQUIPMENT = [
  "УЗИ",
  "КТ/МРТ",
  "Операционная",
  "Рентген",
  "Лаборатория",
  "Реанимация",
];
const DEFAULT_PATIENT_CONDITIONS = [
  "Парковка",
  "Детская зона",
  "Онлайн-консультация",
  "Доступ для инвалидов",
  "Аптека",
];
const DEFAULT_PAYMENT_METHODS = ["Наличные", "Карта", "Онлайн"];

type D = {
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
  equipment: string[];
  patientConditions: string[];
  paymentMethods: string[];
  isOnlineAvailable: boolean;
  consultationPrice: string;
  isPublished: boolean;
};

const { fieldList, formGrid } = formStyles;

const EMPTY: D = {
  specialty: "",
  additionalSpecialty: "",
  experienceYears: "",
  currentPosition: "",
  workplace: "",
  qualification: "",
  scientificDegree: "",
  equipment: [],
  patientConditions: [],
  paymentMethods: [],
  isOnlineAvailable: false,
  consultationPrice: "",
  isPublished: false,
};

// Один источник для первичной синхронизации и для отмены правок — иначе при
// добавлении поля легко забыть один из двух списков.
const fromProfile = (p: DoctorProfileData): D => ({
  specialty: p.specialty,
  additionalSpecialty: p.additionalSpecialty,
  experienceYears: p.experienceYears,
  currentPosition: p.currentPosition,
  workplace: p.workplace,
  qualification: p.qualification,
  scientificDegree: p.scientificDegree,
  equipment: p.equipment,
  patientConditions: p.patientConditions,
  paymentMethods: p.paymentMethods,
  isOnlineAvailable: p.isOnlineAvailable,
  consultationPrice: p.consultationPrice,
  isPublished: p.isPublished,
});

export const DoctorProfessionalInfoSection: FC = () => {
  const { profile, isLoading, isSaving, saveProfile, rawProfile } =
    useDoctorCabinet();
  const { setActive } = useMyDataTabs();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [d, setD] = useState<D>(EMPTY);

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
    setD(fromProfile(profile));
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

  // Оборудование/условия/оплата — тот же справочник бэка, что и у клиники
  // (GET /api/references/equipment|conditions|payment-methods/).
  const { values: equipmentOptions } = useReferenceValues(
    referenceKeys.equipment(),
    getEquipment,
    DEFAULT_EQUIPMENT,
  );
  const { values: conditionOptions } = useReferenceValues(
    referenceKeys.conditions(),
    getConditions,
    DEFAULT_PATIENT_CONDITIONS,
  );
  const { values: paymentMethodOptions } = useReferenceValues(
    referenceKeys.paymentMethods(),
    getPaymentMethods,
    DEFAULT_PAYMENT_METHODS,
  );

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
      equipment: d.equipment,
      patient_conditions: d.patientConditions,
      payment_methods: d.paymentMethods,
      is_online_available: d.isOnlineAvailable,
      // Бэк ждёт decimal-строку. Пустое поле отправляем как "0.00", иначе
      // цена не сбрасывается: пустую строку сериализатор отклоняет.
      consultation_price: d.consultationPrice.trim()
        ? `${parseFloat(d.consultationPrice.replace(",", ".")) || 0}`
        : "0.00",
      is_published: d.isPublished,
    });
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

  const handleCancel = () => {
    if (profile) setD(fromProfile(profile));
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
              <CheckboxGroup
                label="Оборудование"
                options={equipmentOptions}
                value={d.equipment}
                onChange={(v) => set("equipment", v)}
              />
            ) : (
              <FieldView label="Оборудование" value={d.equipment} />
            )}
          </div>
          <div className="lg:col-span-2">
            {isEditing ? (
              <CheckboxGroup
                label="Условия приёма"
                options={conditionOptions}
                value={d.patientConditions}
                onChange={(v) => set("patientConditions", v)}
              />
            ) : (
              <FieldView label="Условия приёма" value={d.patientConditions} />
            )}
          </div>
          <div className="lg:col-span-2">
            {isEditing ? (
              <CheckboxGroup
                label="Способы оплаты"
                options={paymentMethodOptions}
                value={d.paymentMethods}
                onChange={(v) => set("paymentMethods", v)}
              />
            ) : (
              <FieldView label="Способы оплаты" value={d.paymentMethods} />
            )}
          </div>
        </div>

        {/* Онлайн-приём и публикация. Отдельным блоком, а не в сетке полей:
            от этих двух флагов зависит, увидят ли врача в каталоге и смогут
            ли записаться на видеоконсультацию. */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Онлайн-приём и публикация
          </h3>

          {isEditing ? (
            <div className="flex flex-col gap-4">
              <Checkbox
                size="large"
                label="Принимаю онлайн (видеоконсультации)"
                checked={d.isOnlineAvailable}
                onChange={(e) => set("isOnlineAvailable", e.target.checked)}
              />
              <div className="max-w-xs">
                <Input
                  label="Стоимость консультации, сом"
                  type="number"
                  min="0"
                  step="1"
                  value={d.consultationPrice}
                  onChange={(e) => set("consultationPrice", e.target.value)}
                  placeholder="0"
                  disabled={!d.isOnlineAvailable}
                />
              </div>
              <Checkbox
                size="large"
                label="Опубликовать профиль в каталоге"
                checked={d.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
              />
              <p className="text-muted text-sm">
                Пока профиль не опубликован, он не показывается в поиске и на
                него нельзя записаться.
              </p>
            </div>
          ) : (
            <div className={fieldList}>
              <FieldView
                label="Приём онлайн"
                value={d.isOnlineAvailable ? "Включён" : "Отключён"}
              />
              <FieldView
                label="Стоимость консультации, сом"
                value={d.consultationPrice}
              />
              <FieldView
                label="Профиль в каталоге"
                value={d.isPublished ? "Опубликован" : "Не опубликован"}
              />
            </div>
          )}
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
        isLoading={isSaving}
        closeOnConfirm={false}
      />
    </DoctorPageLayout>
  );
};
