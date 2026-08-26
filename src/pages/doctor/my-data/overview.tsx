"use client";

import { FC, useRef, useState } from "react";

import {
  CheckboxGroup,
  FieldView,
  SectionCard,
  formStyles,
  useDoctorCabinet,
} from "@/widgets/doctor/layout";

import { toApiEducation } from "@/entities/doctor-education";
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
import { MAX_DOCUMENT_MB, isFileSizeAllowed } from "@/shared/lib/files";
import { useReferenceValues } from "@/shared/lib/useReference";
import {
  Button,
  CancelEditButton,
  Checkbox,
  ConfirmDialog,
  DateField,
  Dropdown,
  IconBtn,
  ImageWithFallback,
  Input,
  PhoneInput,
} from "@/shared/ui";

// Те же дефолты, что у клиники (pages/clinic/clinic-profile/sections/
// equipment/ui.tsx) и у мобильного sections/professional.tsx — используются
// только пока справочник бэка не пришёл.
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

const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

// "ГГГГ-ММ-ДД" → "ДД.ММ.ГГГГ"; уже-ДД.ММ.ГГГГ/пусто отдаём как есть
const fromApiDate = (v: string): string => {
  const t = v.trim();
  if (!t) return "";
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : t;
};

// "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; уже-ISO значение оставляем как есть
const toApiDate = (v: string): string | null => {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
};

// По макету (screenshots/main-info.png) разделы — одна колонка с тонкими
// разделителями, а не сетка в две колонки, как на мобильных экранах-разделах.
const { stackedList: fieldList, stackedForm: formGrid } = formStyles;

const PlusIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M7 2V12M2 7H12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M11.3334 2.00001C11.5085 1.82491 11.7163 1.68602 11.9451 1.59126C12.1739 1.4965 12.4191 1.44769 12.6667 1.44769C12.9143 1.44769 13.1595 1.4965 13.3883 1.59126C13.6171 1.68602 13.8249 1.82491 14.0001 2.00001C14.1752 2.17511 14.3141 2.38291 14.4088 2.61172C14.5036 2.84052 14.5524 3.08571 14.5524 3.33334C14.5524 3.58097 14.5036 3.82617 14.4088 4.05497C14.3141 4.28377 14.1752 4.49158 14.0001 4.66668L5.00008 13.6667L1.33341 14.6667L2.33341 11L11.3334 2.00001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Объединённая форма «Моих данных» — тот же набор полей, что у четырёх
// мобильных экранов sections/{basic,professional,education,documents}.tsx,
// но одной формой с общим «Редактировать/Сохранить» (см. entities/
// clinic-profile ClinicProfileForm — тот же приём у клиники). Мобильные
// экраны остаются отдельными: там разделы открываются по одному с экрана-
// списка «Мои данные» (DoctorMyDataList), макет этого не касается.
type D = {
  fullName: string;
  gender: string;
  birthDate: string;
  city: string;
  languages: string;
  phone: string;
  email: string;
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
  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string[];
  licenseNumber: string;
};

const EMPTY: D = {
  fullName: "",
  gender: "",
  birthDate: "",
  city: "",
  languages: "",
  phone: "",
  email: "",
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
  university: "",
  graduationYear: "",
  internship: "",
  residency: "",
  diplomaSpecialty: "",
  additionalEducation: [],
  licenseNumber: "",
};

// Один источник для первичной синхронизации и для отмены правок — иначе при
// добавлении поля легко забыть один из списков (см. тот же приём в каждой
// из четырёх мобильных секций).
const fromProfile = (
  p: NonNullable<ReturnType<typeof useDoctorCabinet>["profile"]>,
): D => ({
  fullName: p.fullName,
  gender: p.gender,
  birthDate: fromApiDate(p.birthDate),
  city: p.city,
  languages: p.languages,
  phone: p.phone,
  email: p.email,
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
  university: p.university,
  graduationYear: p.graduationYear,
  internship: p.internship,
  residency: p.residency,
  diplomaSpecialty: p.diplomaSpecialty,
  additionalEducation: [...p.additionalEducation],
  licenseNumber: p.licenseNumber,
});

export const DoctorMyDataOverview: FC = () => {
  const {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    rawProfile,
    documents,
    uploadDocument,
    deleteDocument,
    isUploadingDocument,
  } = useDoctorCabinet();

  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [d, setD] = useState<D>(EMPTY);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const photoRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  // Синхронизация формы с профилем прямо в рендере («adjust state during
  // render»). Трекер стартует именно с null, а не с текущего profile: запрос
  // может быть уже в кеше при первом монтировании, и с useState(profile)
  // условие ниже никогда не сработало бы — форма осталась бы пустой.
  //
  // !isEditing — иначе загрузка/удаление сертификата (documents.tsx) меняет
  // ссылку на profile (там свой запрос) и это условие перезаписывает d,
  // стирая любые несохранённые правки во ВСЕХ секциях сразу, не только в
  // документах. Пока форма в режиме редактирования, извне её не трогаем.
  const [syncedProfile, setSyncedProfile] = useState<typeof profile>(null);
  if (profile && profile !== syncedProfile && !isEditing) {
    setSyncedProfile(profile);
    setD(fromProfile(profile));
    setPhotoPreview(profile.photo);
  }

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const { options: specializationOptions, isLoading: isSpecsLoading } =
    useSpecializationOptions();
  const { data: specializationList = [] } = useSpecializations();
  const specializationPlaceholder = isSpecsLoading
    ? "Загружаем список..."
    : "Выберите";

  // Оборудование/условия/оплата — справочник бэка
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

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !isFileSizeAllowed(file, MAX_DOCUMENT_MB)) return;
    // Файл уходит сразу: профильный endpoint сертификаты не принимает, и
    // «Сохранить» их бы не отправило (тот же приём, что в documents.tsx).
    await uploadDocument(file);
  };

  const handleSave = async () => {
    // Должность/место/категория/степень отдельных полей на бэке не имеют —
    // храним их в первой записи work_experience (бэк сохраняет произвольные
    // ключи как JSON). Сохраняем существующие ключи, если они уже были.
    const existing =
      (
        rawProfile as unknown as {
          work_experience?: Record<string, unknown>[];
        } | null
      )?.work_experience?.[0] ?? {};

    const { ids: primaryIds } = resolveSpecializationIds(
      d.specialty ? [d.specialty] : [],
      specializationList,
    );
    const { ids: narrowIds } = resolveSpecializationIds(
      d.additionalSpecialty ? [d.additionalSpecialty] : [],
      specializationList,
    );

    // Бэк требует first_name + last_name (full_name он игнорирует и падает 400)
    const parts = d.fullName.trim().split(/\s+/);

    await saveProfile({
      first_name: parts[0] ?? "",
      last_name: parts.slice(1).join(" ") || (parts[0] ?? ""),
      gender: d.gender || undefined,
      birth_date: toApiDate(d.birthDate),
      city: d.city,
      languages: d.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      phone: d.phone || undefined,
      ...(pendingPhoto ? { photo: pendingPhoto } : {}),
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
      education: toApiEducation({
        university: d.university,
        diplomaSpecialty: d.diplomaSpecialty,
        graduationYear: d.graduationYear,
        internship: d.internship,
        residency: d.residency,
        additionalEducation: d.additionalEducation,
      }),
      license_number: d.licenseNumber,
    });
    setPendingPhoto(null);
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

  const handleCancel = () => {
    if (profile) {
      setD(fromProfile(profile));
      setPhotoPreview(profile.photo);
    }
    setPendingPhoto(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[32px] font-semibold text-foreground">
          Мои данные
        </h2>
        {isEditing ? (
          <div className="flex items-center gap-3">
            <CancelEditButton onClick={handleCancel} disabled={isSaving} />
            <Button
              onClick={() => setShowSaveConfirm(true)}
              disabled={isSaving}
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            IconLeft={PencilIcon}
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </Button>
        )}
      </div>

      {/* ── 1. Основная информация ─────────────────────────────────────── */}
      <SectionCard title="Основная информация">
        <div className={isEditing ? formGrid : fieldList}>
          <div>
            {isEditing ? (
              <Input
                label="ФИО"
                value={d.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Введите ФИО"
              />
            ) : (
              <FieldView label="ФИО" value={d.fullName} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={formStyles.lbl}>Пол</label>
                <div className="flex gap-4">
                  {GENDER_OPTIONS.map(({ label, value }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => set("gender", value)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${d.gender === value ? "border-primary" : "border-dim"}`}
                      >
                        {d.gender === value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-foreground text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <FieldView
                label="Пол"
                value={
                  GENDER_OPTIONS.find((g) => g.value === d.gender)?.label ??
                  d.gender
                }
              />
            )}
          </div>
          <div>
            {isEditing ? (
              <DateField
                label="Дата рождения"
                value={d.birthDate}
                onChange={(v) => set("birthDate", v)}
                min="01.01.1920"
                maxToday
              />
            ) : (
              <FieldView label="Дата рождения" value={d.birthDate} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Город"
                value={d.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Введите город"
              />
            ) : (
              <FieldView label="Город" value={d.city} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Языки общения"
                value={d.languages}
                onChange={(e) => set("languages", e.target.value)}
                placeholder="Русский, Английский"
              />
            ) : (
              <FieldView label="Языки общения" value={d.languages} />
            )}
          </div>
          <div>
            {isEditing ? (
              <PhoneInput
                label="Телефон"
                value={d.phone.replace(/^\+?996/, "")}
                onChange={(v) => set("phone", v ? `+996${v}` : "")}
              />
            ) : (
              <FieldView label="Телефон" value={d.phone} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Почта"
                type="email"
                value={d.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="example@mail.com"
                // UpdateDoctorProfileBody не принимает email — бэк его молча
                // игнорирует на PUT /api/doctor/profile/.
                disabled
              />
            ) : (
              <FieldView label="Почта" value={d.email} />
            )}
          </div>

          {/* По макету «Фото» — последнее поле карточки, с подписью и по
              левому краю (а не аватар сверху по центру). */}
          <div>
            <p className="text-muted text-sm mb-2">Фото</p>
            <div className="relative w-28 h-28">
              <div className="w-full h-full rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                <ImageWithFallback
                  src={photoPreview}
                  alt={d.fullName}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  fallback={
                    <span className="text-white text-3xl font-bold">
                      {d.fullName.charAt(0)}
                    </span>
                  }
                />
              </div>
              {isEditing && (
                <>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                  <IconBtn
                    onClick={() => photoRef.current?.click()}
                    className="absolute bottom-1 right-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M10 1.5a1.5 1.5 0 012.121 2.121L4.5 11.25 2 12l.75-2.5L10 1.5z"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </IconBtn>
                </>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Профессиональные данные ─────────────────────────────────── */}
      <SectionCard title="Профессиональные данные">
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
          <div>
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
          <div>
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
          <div>
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
          <div>
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

        {/* Онлайн-приём и публикация. Отдельным блоком: от этих двух флагов
            зависит, увидят ли врача в каталоге и смогут ли записаться на
            видеоконсультацию. */}
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
      </SectionCard>

      {/* ── 3. Образование ──────────────────────────────────────────────── */}
      <SectionCard title="Образование">
        <div className={isEditing ? formGrid : fieldList}>
          <div>
            {isEditing ? (
              <Input
                label="ВУЗ"
                value={d.university}
                onChange={(e) => set("university", e.target.value)}
                placeholder="Название учебного заведения"
              />
            ) : (
              <FieldView label="ВУЗ" value={d.university} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Год окончания"
                value={d.graduationYear}
                onChange={(e) => set("graduationYear", e.target.value)}
                placeholder="ГГГГ"
              />
            ) : (
              <FieldView label="Год окончания" value={d.graduationYear} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Интернатура"
                value={d.internship}
                onChange={(e) => set("internship", e.target.value)}
                placeholder="Специальность"
              />
            ) : (
              <FieldView label="Интернатура" value={d.internship} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Ординатура"
                value={d.residency}
                onChange={(e) => set("residency", e.target.value)}
                placeholder="Специальность"
              />
            ) : (
              <FieldView label="Ординатура" value={d.residency} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Специализация по диплому"
                value={d.diplomaSpecialty}
                onChange={(e) => set("diplomaSpecialty", e.target.value)}
                placeholder="Введите специализацию"
              />
            ) : (
              <FieldView
                label="Специализация по диплому"
                value={d.diplomaSpecialty}
              />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Дополнительное образование</p>
              {isEditing && (
                <Button
                  variant="text"
                  size="xs"
                  className="text-primary"
                  IconLeft={PlusIcon}
                  onClick={() =>
                    set("additionalEducation", [...d.additionalEducation, ""])
                  }
                >
                  Добавить
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {d.additionalEducation.length === 0 && (
                  <div className="text-dim text-sm px-4 py-3 rounded-2xl border border-dashed border-border text-center">
                    Нажмите «Добавить»
                  </div>
                )}
                {d.additionalEducation.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        set(
                          "additionalEducation",
                          d.additionalEducation.map((v, j) =>
                            j === i ? e.target.value : v,
                          ),
                        )
                      }
                      placeholder="Курс, год"
                      className="flex-1"
                    />
                    <IconBtn
                      onClick={() =>
                        set(
                          "additionalEducation",
                          d.additionalEducation.filter((_, j) => j !== i),
                        )
                      }
                      variant="text"
                      size="xs"
                      className="text-dim hover:text-primary"
                    >
                      <CloseIcon />
                    </IconBtn>
                  </div>
                ))}
              </div>
            ) : (
              <FieldView label="" value={d.additionalEducation} />
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Сертификаты и документы ─────────────────────────────────── */}
      <SectionCard title="Сертификаты и документы">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted text-sm">Сертификаты</p>
              {isEditing && (
                <>
                  <input
                    ref={certRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCertUpload}
                    className="hidden"
                  />
                  <Button
                    variant="text"
                    size="xs"
                    className="text-primary"
                    IconLeft={PlusIcon}
                    onClick={() => certRef.current?.click()}
                    loading={isUploadingDocument}
                  >
                    Добавить документ
                  </Button>
                </>
              )}
            </div>

            {/* Список сертификатов рисуем прямо из живого запроса
                (documents/certificates), а не из d — они грузятся/удаляются
                сразу, без «Сохранить», и не должны застревать в стейте формы. */}
            <div className="flex flex-wrap gap-3">
              {documents.length === 0 ? (
                <div className="text-dim text-sm py-2">
                  Нет загруженных документов
                </div>
              ) : null}
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-surface"
                >
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Скачать сертификат"
                    title="Скачать сертификат"
                    className="block w-full h-full cursor-pointer"
                  >
                    <ImageWithFallback
                      src={doc.url}
                      alt="cert"
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
                  {isEditing && (
                    <button
                      onClick={() => void deleteDocument(doc.id)}
                      className="absolute top-0 right-0 z-10 w-1/2 aspect-square bg-primary flex items-center justify-center"
                    >
                      <svg
                        className="w-1/2 h-1/2"
                        viewBox="0 0 8 8"
                        fill="none"
                      >
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
              {isEditing && documents.length === 0 && (
                <button
                  onClick={() => certRef.current?.click()}
                  disabled={isUploadingDocument}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-dim hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 4V16M4 10H16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div>
            {isEditing ? (
              <Input
                label="Номер лицензии"
                value={d.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
                placeholder="ЛИЦ-XXXXXX"
              />
            ) : (
              <FieldView label="Номер лицензии" value={d.licenseNumber} />
            )}
          </div>
        </div>
      </SectionCard>

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
    </>
  );
};
