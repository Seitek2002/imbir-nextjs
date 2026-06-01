"use client";

import { FC, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import {
  FieldView,
  formStyles,
  useDoctorCabinet,
} from "@/entities/doctor-profile";

import { PhoneInput } from "@/shared/ui";

const { inp, lbl } = formStyles;

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

  useEffect(() => {
    if (profile) {
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
  }, [profile]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await saveProfile({
      full_name: d.fullName,
      city: d.city,
      languages: d.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      phone: d.phone || undefined,
      email: d.email || undefined,
    });
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Основная информация";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Основная информация">
        <div className="flex items-center justify-center py-20 text-[#838A8D]">
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
        <h2 className="text-[28px] font-semibold text-[#191A1B]">{title}</h2>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-60 ${isEditing ? "bg-[#F5653E] text-white hover:bg-[#E5542D]" : "border border-[#E5E6E8] text-[#686F72] hover:bg-[#F8F9FA]"}`}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E6E8] p-5 lg:p-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center">
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
                <button
                  onClick={() => photoRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#F5653E] flex items-center justify-center"
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
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="lg:col-span-2">
            {isEditing ? (
              <>
                <label className={lbl}>ФИО</label>
                <input
                  value={d.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Введите ФИО"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="ФИО" value={d.fullName} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Пол</label>
                <div className="flex gap-4">
                  {["Мужской", "Женский"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => set("gender", g)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${d.gender === g ? "border-[#F5653E]" : "border-[#C4C8CA]"}`}
                      >
                        {d.gender === g && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F5653E]" />
                        )}
                      </div>
                      <span className="text-[#191A1B] text-sm">{g}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <FieldView label="Пол" value={d.gender} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Дата рождения</label>
                <input
                  value={d.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)}
                  placeholder="ДД.ММ.ГГГГ"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Дата рождения" value={d.birthDate} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Город</label>
                <input
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Введите город"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Город" value={d.city} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Языки общения</label>
                <input
                  value={d.languages}
                  onChange={(e) => set("languages", e.target.value)}
                  placeholder="Русский, Английский"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Языки общения" value={d.languages} />
            )}
          </div>
          <div>
            {isEditing ? (
              <PhoneInput
                label="Телефон"
                value={d.phone}
                onChange={(v) => set("phone", v)}
              />
            ) : (
              <FieldView label="Телефон" value={d.phone} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Почта</label>
                <input
                  type="email"
                  value={d.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="example@mail.com"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Почта" value={d.email} />
            )}
          </div>
        </div>
      </div>
    </DoctorPageLayout>
  );
};
