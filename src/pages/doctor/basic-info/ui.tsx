"use client";

import { FC, useRef, useState } from "react";

import Image from "next/image";

import { DoctorPageLayout } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView, formStyles } from "@/widgets/doctor/layout";

import { Button, IconBtn, Input, PhoneInput } from "@/shared/ui";

const { lbl } = formStyles;

const GENDER_OPTIONS = [
  { label: "Мужской", value: "male" },
  { label: "Женский", value: "female" },
];

export const DoctorBasicInfoPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
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

  // Синхронизация формы с профилем прямо в рендере («adjust state during
  // render» вместо setState в эффекте).
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setD({
      fullName: profile.fullName,
      gender: profile.gender,
      birthDate: profile.birthDate,
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
    if (!file) return;
    setPendingPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  // "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; уже-ISO значение оставляем как есть
  const toApiDate = (v: string): string | null => {
    const t = v.trim();
    if (!t) return null;
    const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
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
      ...(pendingPhoto ? { photo: pendingPhoto } : {}),
    });
    setPendingPhoto(null);
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Основная информация";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Основная информация">
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
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <Input
                label="Дата рождения"
                value={d.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
                placeholder="ДД.ММ.ГГГГ"
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
              />
            ) : (
              <FieldView label="Почта" value={d.email} />
            )}
          </div>
        </div>
      </div>
    </DoctorPageLayout>
  );
};
