"use client";

import { FC, useRef, useState } from "react";

import { DoctorPageLayout, useMyDataTabs } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView, formStyles } from "@/widgets/doctor/layout";

import { CheckIcon } from "@/shared/assets/icons";
import {
  Button,
  CancelEditButton,
  ConfirmDialog,
  DateField,
  IconBtn,
  ImageWithFallback,
  Input,
  PhoneInput,
} from "@/shared/ui";

// "ГГГГ-ММ-ДД" → "ДД.ММ.ГГГГ"; уже-ДД.ММ.ГГГГ/пусто отдаём как есть
const fromApiDate = (v: string): string => {
  const t = v.trim();
  if (!t) return "";
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : t;
};

const { lbl, fieldList, formGrid } = formStyles;

const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

export const DoctorBasicInfoSection: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useDoctorCabinet();
  const { setActive } = useMyDataTabs();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [d, setD] = useState({
    fullName: "",
    gender: "",
    birthDate: "",
    city: "",
    languages: "",
    phone: "",
    email: "",
    photo: undefined as string | undefined,
  });
  const photoRef = useRef<HTMLInputElement>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [showPhotoProcessingConfirm, setShowPhotoProcessingConfirm] =
    useState(false);

  // Синхронизация формы с профилем прямо в рендере («adjust state during
  // render» вместо setState в эффекте).
  // Инициализируем трекер именно null, а не текущим profile: макет кабинета
  // (DoctorPageLayoutSkeleton) держит тот же запрос смонтированным, поэтому при
  // переходе между вкладками страница монтируется, когда профиль уже в кеше.
  // С useState(profile) первый же рендер записывал его в трекер, условие ниже
  // не срабатывало никогда — и форма оставалась пустой.
  const [syncedProfile, setSyncedProfile] = useState<typeof profile>(null);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setD({
      fullName: profile.fullName,
      gender: profile.gender,
      birthDate: fromApiDate(profile.birthDate),
      city: profile.city,
      languages: profile.languages,
      phone: profile.phone,
      email: profile.email,
      photo: profile.photo,
    });
  }

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingPhoto(file);
    setShowPhotoProcessingConfirm(true);
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  // "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; уже-ISO значение оставляем как есть
  const toApiDate = (v: string): null | string => {
    const t = v.trim();
    if (!t) return null;
    const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
  };

  // Фото отправляется сразу после выбора варианта обработки, без ожидания
  // общего сохранения остальных полей формы.
  const saveSelectedPhoto = async (shouldProcess: boolean) => {
    if (!pendingPhoto) return;
    try {
      await saveProfile(
        { photo: pendingPhoto },
        { processPhoto: shouldProcess },
      );
      setPendingPhoto(null);
      setShowPhotoProcessingConfirm(false);
    } catch {
      // Ошибку уже выводит useDoctorCabinet.
    }
  };

  const discardSelectedPhoto = () => {
    setPendingPhoto(null);
    set("photo", profile?.photo);
    setShowPhotoProcessingConfirm(false);
  };

  const handleSave = async () => {
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
    });
    setPendingPhoto(null);
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

  const handleCancel = () => {
    if (profile) {
      setD({
        fullName: profile.fullName,
        gender: profile.gender,
        birthDate: fromApiDate(profile.birthDate),
        city: profile.city,
        languages: profile.languages,
        phone: profile.phone,
        email: profile.email,
        photo: profile.photo,
      });
    }
    setPendingPhoto(null);
    setShowPhotoProcessingConfirm(false);
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Основная информация";

  if (isLoading) {
    return (
      <DoctorPageLayout
        title="Основная информация"
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
      onCancel={handleCancel}
      onEditToggle={
        isEditing ? () => setShowSaveConfirm(true) : () => setIsEditing(true)
      }
      // Из формы редактирования «назад» возвращает к просмотру раздела,
      // из просмотра — к списку разделов «Моих данных» (мобильный сценарий
      // макета). На десктопе мобильной шапки нет.
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

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8 flex flex-col lg:block">
        {/* По макету на мобильном «Фото» — последнее поле карточки, поэтому
            order-last; на десктопе аватар остаётся сверху по центру. */}
        <div className="order-last pt-3 border-t border-background lg:order-none lg:pt-0 lg:mb-6 lg:border-0 lg:flex lg:justify-center">
          <p className="text-muted text-xs mb-2 lg:hidden">Фото</p>
          <div className="relative w-28 h-28 lg:w-20 lg:h-20">
            <div className="w-full h-full rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
              <ImageWithFallback
                src={d.photo}
                alt={d.fullName}
                width={112}
                height={112}
                loadingVariant="spinner"
                className="w-full h-full object-cover"
                fallback={
                  <span className="text-white text-2xl font-bold">
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
                  className="absolute bottom-0 right-0"
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

        <div className={isEditing ? formGrid : fieldList}>
          <div className="lg:col-span-2">
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
                <label className={lbl}>Пол</label>
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
                // PhoneInput ждёт нац. часть; храним полный номер с +996
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
                // игнорирует на PUT /api/doctor/profile/ (см. тот же приём у
                // пациента и клиники: поле там задизейблено по той же причине).
                disabled
              />
            ) : (
              <FieldView label="Почта" value={d.email} />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showPhotoProcessingConfirm}
        onClose={discardSelectedPhoto}
        onCancel={() => void saveSelectedPhoto(false)}
        onConfirm={() => void saveSelectedPhoto(true)}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Обработать фото с помощью ИИ?"
        description="ИИ улучшит качество и подготовит фото для профиля врача."
        cancelLabel="Без обработки"
        confirmLabel="Обработать ИИ"
        closeOnCancel={false}
        closeOnConfirm={false}
        isLoading={isSaving}
      />

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
