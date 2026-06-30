"use client";

import { FC, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { Dropdown, PhoneInput } from "@/shared";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import {
  FieldView,
  formStyles,
  useDoctorCabinet,
} from "@/entities/doctor-profile";

const { inp, lbl } = formStyles;

type D = {
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

const EMPTY: D = {
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

const CITY_OPTIONS = [
  "Бишкек",
  "Ош",
  "Джалал-Абад",
  "Каракол",
  "Токмок",
  "Нарын",
].map((c) => ({ label: c, value: c }));

const LANGUAGE_OPTIONS = ["Русский", "Кыргызский", "Английский"].map((l) => ({
  label: l,
  value: l,
}));

const SectionCard: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h3 className="text-base lg:text-lg font-semibold text-[#191A1B] mb-3">
      {title}
    </h3>
    <div className="bg-white rounded-3xl border border-[#E5E6E8] p-5 lg:p-8">
      {children}
    </div>
  </div>
);

export const DoctorMyDataPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<D>(EMPTY);
  const photoRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setD({
      fullName: profile.fullName,
      gender: profile.gender,
      birthDate: profile.birthDate,
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
      additionalEducation: [...profile.additionalEducation],
      licenseNumber: profile.licenseNumber,
      certificates: [...profile.certificates],
    });
  }, [profile]);

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      set("certificates", [...d.certificates, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const parts = d.fullName.trim().split(/\s+/);
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
      last_name: parts[0] ?? "",
      first_name: parts.slice(1).join(" "),
      gender: d.gender || undefined,
      birth_date: d.birthDate || null,
      city: d.city,
      languages: d.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      phone: d.phone || undefined,
      primary_specializations: [d.specialty].filter(Boolean),
      narrow_specializations: [d.additionalSpecialty].filter(Boolean),
      experience_years: parseInt(d.experienceYears) || 0,
      education: [...mainEdu, ...addEdu],
      license_number: d.licenseNumber,
    });
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать данные" : "Мои данные";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Мои данные">
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-60 ${
            isEditing
              ? "bg-[#F5653E] text-white hover:bg-[#E5542D]"
              : "border border-[#E5E6E8] text-[#686F72] hover:bg-[#F8F9FA]"
          }`}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Основная информация ─────────────────────────────────────── */}
        <SectionCard title="Основная информация">
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
                <Dropdown
                  label="Город"
                  placeholder="Выберите из списка"
                  options={CITY_OPTIONS}
                  value={d.city}
                  onChange={(v) => set("city", v as string)}
                />
              ) : (
                <FieldView label="Город" value={d.city} />
              )}
            </div>
            <div>
              {isEditing ? (
                <Dropdown
                  label="Языки общения"
                  placeholder="Выберите из списка"
                  options={LANGUAGE_OPTIONS}
                  isMulti
                  value={
                    d.languages ? d.languages.split(", ").filter(Boolean) : []
                  }
                  onChange={(v) => set("languages", (v as string[]).join(", "))}
                />
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

            {/* Фото */}
            <div className="lg:col-span-2">
              <label className={lbl}>Фото</label>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              {isEditing ? (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5E6E8] p-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center shrink-0">
                    {d.photo ? (
                      <Image
                        src={d.photo}
                        alt={d.fullName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized={d.photo.startsWith("data:")}
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {d.fullName.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E5E6E8] text-[#686F72] text-sm font-medium hover:bg-[#F8F9FA] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M11.333 2a1.667 1.667 0 012.357 2.357L5 13.05 1.667 14l.95-3.333L11.333 2z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Новое фото
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center">
                  {d.photo ? (
                    <Image
                      src={d.photo}
                      alt={d.fullName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized={d.photo.startsWith("data:")}
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {d.fullName.charAt(0) || "?"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Профессиональные данные ─────────────────────────────────── */}
        <SectionCard title="Профессиональные данные">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              {isEditing ? (
                <Dropdown
                  label="Специализация"
                  placeholder="Выберите"
                  options={[
                    "Терапевт",
                    "Кардиолог",
                    "Хирург",
                    "Педиатр",
                    "Невролог",
                  ].map((o) => ({ label: o, value: o }))}
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
                  placeholder="Выберите"
                  options={["Кардиолог", "Терапевт", "Хирург", "Педиатр"].map(
                    (o) => ({ label: o, value: o }),
                  )}
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
                <>
                  <label className={lbl}>Стаж работы, лет</label>
                  <input
                    type="number"
                    min="0"
                    value={d.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Стаж работы, лет" value={d.experienceYears} />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Текущая должность</label>
                  <input
                    value={d.currentPosition}
                    onChange={(e) => set("currentPosition", e.target.value)}
                    placeholder="Введите должность"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView
                  label="Текущая должность"
                  value={d.currentPosition}
                />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Место работы (клиника)</label>
                  <input
                    value={d.workplace}
                    onChange={(e) => set("workplace", e.target.value)}
                    placeholder="Введите название клиники"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Место работы (клиника)" value={d.workplace} />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Категория / Квалификация</label>
                  <input
                    value={d.qualification}
                    onChange={(e) => set("qualification", e.target.value)}
                    placeholder="Введите категорию"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView
                  label="Категория / Квалификация"
                  value={d.qualification}
                />
              )}
            </div>
            <div className="lg:col-span-2">
              {isEditing ? (
                <>
                  <label className={lbl}>Научная степень</label>
                  <input
                    value={d.scientificDegree}
                    onChange={(e) => set("scientificDegree", e.target.value)}
                    placeholder="Введите степень"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Научная степень" value={d.scientificDegree} />
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Образование ─────────────────────────────────────────────── */}
        <SectionCard title="Образование">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>ВУЗ</label>
                  <input
                    value={d.university}
                    onChange={(e) => set("university", e.target.value)}
                    placeholder="Название учебного заведения"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="ВУЗ" value={d.university} />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Год окончания</label>
                  <input
                    value={d.graduationYear}
                    onChange={(e) => set("graduationYear", e.target.value)}
                    placeholder="ГГГГ"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Год окончания" value={d.graduationYear} />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Интернатура</label>
                  <input
                    value={d.internship}
                    onChange={(e) => set("internship", e.target.value)}
                    placeholder="Специальность"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Интернатура" value={d.internship} />
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Ординатура</label>
                  <input
                    value={d.residency}
                    onChange={(e) => set("residency", e.target.value)}
                    placeholder="Специальность"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Ординатура" value={d.residency} />
              )}
            </div>
            <div className="lg:col-span-2">
              {isEditing ? (
                <>
                  <label className={lbl}>Специализация по диплому</label>
                  <input
                    value={d.diplomaSpecialty}
                    onChange={(e) => set("diplomaSpecialty", e.target.value)}
                    placeholder="Введите специализацию"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView
                  label="Специализация по диплому"
                  value={d.diplomaSpecialty}
                />
              )}
            </div>
            <div className="lg:col-span-2">
              {isEditing ? (
                <>
                  <label className={lbl}>Дополнительное образование</label>
                  <input
                    value={d.additionalEducation.join(", ")}
                    onChange={(e) =>
                      set(
                        "additionalEducation",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="Курсы повышения квалификации"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView
                  label="Дополнительное образование"
                  value={d.additionalEducation}
                />
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Сертификаты и документы ─────────────────────────────────── */}
        <SectionCard title="Сертификаты и документы">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#838A8D] text-sm">Сертификаты</p>
                {isEditing && (
                  <>
                    <input
                      ref={certRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleCert}
                      className="hidden"
                    />
                    <button
                      onClick={() => certRef.current?.click()}
                      className="text-[#F5653E] text-sm font-medium flex items-center gap-1"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M7 2V12M2 7H12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Добавить документ
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {d.certificates.length === 0 && (
                  <div className="text-[#C4C8CA] text-sm py-2">
                    Нет загруженных документов
                  </div>
                )}
                {d.certificates.map((cert, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E5E6E8] bg-[#F8F9FA]"
                  >
                    <Image
                      src={cert}
                      alt={`cert-${i}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized={cert.startsWith("data:")}
                    />
                    {isEditing && (
                      <button
                        onClick={() =>
                          set(
                            "certificates",
                            d.certificates.filter((_, j) => j !== i),
                          )
                        }
                        className="absolute top-0 right-0 w-1/2 aspect-square bg-[#F5653E] flex items-center justify-center"
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
              </div>
            </div>

            <div>
              {isEditing ? (
                <>
                  <label className={lbl}>Номер лицензии</label>
                  <input
                    value={d.licenseNumber}
                    onChange={(e) => set("licenseNumber", e.target.value)}
                    placeholder="ЛИЦ-XXXXXX"
                    className={inp}
                  />
                </>
              ) : (
                <FieldView label="Номер лицензии" value={d.licenseNumber} />
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </DoctorPageLayout>
  );
};
