"use client";

import { useRef, useState } from "react";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { ConfirmDialog } from "@/shared";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { MOCK_CLINIC_PROFILE } from "@/entities/clinic-profile";
import {
  EMPTY_SPECIALIST_FORM,
  type SpecialistFormData,
  useSpecialistsStore,
} from "@/entities/clinic-specialist";

import { PhoneInput } from "@/shared/ui";

const TrashIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F5653E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const inp =
  "w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors bg-white";
const lbl = "block text-[#838A8D] text-sm mb-1.5";

const chevron = (
  <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="#686F72"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SpecialistDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { update, remove } = useSpecialistsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [d, setD] = useState<SpecialistFormData>(() => {
    const s = useSpecialistsStore
      .getState()
      .specialists.find((x) => x.id === id);
    if (!s) return { ...EMPTY_SPECIALIST_FORM };
    return {
      fullName: s.fullName,
      gender: s.gender,
      birthDate: s.birthDate,
      city: s.city,
      languages: s.languages,
      phone: s.phone,
      email: s.email,
      photo: s.photo,
      specialty: s.specialty,
      additionalSpecialty: s.additionalSpecialty,
      experienceYears: s.experienceYears,
      currentPosition: s.currentPosition,
      workplace: s.workplace,
      qualification: s.qualification,
      scientificDegree: s.scientificDegree,
      university: s.university,
      graduationYear: s.graduationYear,
      internship: s.internship,
      residency: s.residency,
      diplomaSpecialty: s.diplomaSpecialty,
      additionalEducation: [...s.additionalEducation],
      licenseNumber: s.licenseNumber,
    };
  });

  const [certs, setCerts] = useState<string[]>(() => {
    const s = useSpecialistsStore
      .getState()
      .specialists.find((x) => x.id === id);
    return s ? [...s.certificates] : [];
  });

  const [notFound] = useState(
    () => !useSpecialistsStore.getState().specialists.find((x) => x.id === id),
  );

  const photoRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof SpecialistFormData>(
    field: K,
    value: SpecialistFormData[K],
  ) => setD((prev) => ({ ...prev, [field]: value }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setCerts((prev) => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    update(id, { ...d, certificates: certs });
    setIsEditing(false);
  };

  const handleDelete = () => {
    remove(id);
    router.push("/clinic-profile/specialists");
  };

  if (notFound) {
    return (
      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#191A1B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-[#E5E6E8] p-16 text-center">
          <p className="text-[#838A8D] text-lg">Специалист не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
      <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8">
        Мой профиль
      </h1>

      <div className="flex gap-6">
        <ClinicSidebar
          clinicName={MOCK_CLINIC_PROFILE.name}
          clinicLogo={MOCK_CLINIC_PROFILE.logo}
          rating={MOCK_CLINIC_PROFILE.rating}
        />

        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors shrink-0"
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#191A1B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[28px] font-semibold text-[#191A1B] flex-1 truncate">
              {isEditing ? "Редактировать" : d.fullName}
            </h2>

            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors shrink-0"
              >
                Сохранить
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-full border border-[#E5E6E8] text-[#686F72] font-medium hover:bg-[#F8F9FA] transition-colors flex items-center gap-2 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11.333 2a1.886 1.886 0 012.667 2.667L5.001 13.667 1.334 14.667l1-3.667L11.333 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Редактировать
              </button>
            )}

            {!isEditing && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FFF8F5] transition-colors shrink-0"
                aria-label="Удалить"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2.5 5H4.167M4.167 5H17.5M4.167 5V16.667A1.667 1.667 0 005.833 18.333h8.334A1.667 1.667 0 0015.833 16.667V5H4.167zM6.667 5V3.333A1.667 1.667 0 018.333 1.667h3.334A1.667 1.667 0 0113.333 3.333V5"
                    stroke="#F5653E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E6E8] divide-y divide-[#E5E6E8]">
            {/* 1. Основная информация */}
            <div className="p-8">
              <h3 className="text-[#191A1B] font-semibold text-lg mb-6">
                Основная информация
              </h3>
              <div className="flex gap-8">
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    {isEditing ? (
                      <>
                        <label className={lbl}>ФИО</label>
                        <input
                          type="text"
                          value={d.fullName}
                          onChange={(e) => set("fullName", e.target.value)}
                          placeholder="Введите ФИО"
                          className={inp}
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">ФИО</div>
                        <div className="text-[#191A1B] text-base font-medium">
                          {d.fullName}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <>
                        <label className={lbl}>Пол</label>
                        <div className="relative">
                          <select
                            value={d.gender}
                            onChange={(e) => set("gender", e.target.value)}
                            className={`${inp} appearance-none pr-10`}
                          >
                            <option value="">Выберите</option>
                            <option>Мужской</option>
                            <option>Женский</option>
                          </select>
                          {chevron}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">Пол</div>
                        <div className="text-[#191A1B] text-base">
                          {d.gender || "—"}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <>
                        <label className={lbl}>Дата рождения</label>
                        <input
                          type="text"
                          value={d.birthDate}
                          onChange={(e) => set("birthDate", e.target.value)}
                          placeholder="ДД.ММ.ГГГГ"
                          className={inp}
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">
                          Дата рождения
                        </div>
                        <div className="text-[#191A1B] text-base">
                          {d.birthDate || "—"}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <>
                        <label className={lbl}>Город</label>
                        <input
                          type="text"
                          value={d.city}
                          onChange={(e) => set("city", e.target.value)}
                          placeholder="Введите город"
                          className={inp}
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">Город</div>
                        <div className="text-[#191A1B] text-base">
                          {d.city || "—"}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <>
                        <label className={lbl}>Языки общения</label>
                        <input
                          type="text"
                          value={d.languages}
                          onChange={(e) => set("languages", e.target.value)}
                          placeholder="Русский, Английский"
                          className={inp}
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">
                          Языки общения
                        </div>
                        <div className="text-[#191A1B] text-base">
                          {d.languages || "—"}
                        </div>
                      </>
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
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">
                          Телефон
                        </div>
                        <div className="text-[#191A1B] text-base">
                          {d.phone || "—"}
                        </div>
                      </>
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
                      <>
                        <div className="text-[#838A8D] text-sm mb-1">Почта</div>
                        <div className="text-[#191A1B] text-base">
                          {d.email || "—"}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-3 pt-6">
                  <div className="w-30 h-30 rounded-2xl overflow-hidden bg-[#F8F9FA] border border-[#E5E6E8] flex items-center justify-center">
                    {d.photo ? (
                      <Image
                        src={d.photo}
                        alt="Фото врача"
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
                        <circle cx="24" cy="24" r="24" fill="#E5E6E8" />
                        <path
                          d="M24 12C17.37 12 12 17.37 12 24s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 6c1.99 0 3.6 1.61 3.6 3.6S25.99 25.2 24 25.2s-3.6-1.61-3.6-3.6S22.01 18 24 18zm0 15.6c-3.2 0-6-.8-7.8-3.42.04-2.47 4.92-3.86 7.8-3.86 2.86 0 7.76 1.39 7.8 3.86C29.8 32.8 27.2 33.6 24 33.6z"
                          fill="#C4C8CA"
                        />
                      </svg>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => photoRef.current?.click()}
                        className="px-4 py-1.5 rounded-full border border-[#E5E6E8] text-[#686F72] text-sm hover:bg-[#F8F9FA] transition-colors"
                      >
                        Изменить фото
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Профессиональные данные */}
            <div className="p-8">
              <h3 className="text-[#191A1B] font-semibold text-lg mb-6">
                Профессиональные данные
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Специализация</label>
                      <input
                        type="text"
                        value={d.specialty}
                        onChange={(e) => set("specialty", e.target.value)}
                        placeholder="Введите специализацию"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Специализация
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.specialty || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>
                        Дополнительная специализация
                      </label>
                      <input
                        type="text"
                        value={d.additionalSpecialty}
                        onChange={(e) =>
                          set("additionalSpecialty", e.target.value)
                        }
                        placeholder="Введите специализацию"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Дополнительная специализация
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.additionalSpecialty || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Стаж работы (лет)</label>
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
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Стаж работы (лет)
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.experienceYears || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Текущая должность</label>
                      <input
                        type="text"
                        value={d.currentPosition}
                        onChange={(e) => set("currentPosition", e.target.value)}
                        placeholder="Введите должность"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Текущая должность
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.currentPosition || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Место работы (клиника)</label>
                      <input
                        type="text"
                        value={d.workplace}
                        onChange={(e) => set("workplace", e.target.value)}
                        placeholder="Название клиники"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Место работы (клиника)
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.workplace || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Категория / Квалификация</label>
                      <div className="relative">
                        <select
                          value={d.qualification}
                          onChange={(e) => set("qualification", e.target.value)}
                          className={`${inp} appearance-none pr-10`}
                        >
                          <option value="">Выберите</option>
                          <option>Высшая</option>
                          <option>Первая</option>
                          <option>Вторая</option>
                          <option>Без категории</option>
                        </select>
                        {chevron}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Категория / Квалификация
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.qualification || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div className="col-span-2">
                  {isEditing ? (
                    <>
                      <label className={lbl}>Научная степень</label>
                      <input
                        type="text"
                        value={d.scientificDegree}
                        onChange={(e) =>
                          set("scientificDegree", e.target.value)
                        }
                        placeholder="Введите степень"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Научная степень
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.scientificDegree || "—"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Образование */}
            <div className="p-8">
              <h3 className="text-[#191A1B] font-semibold text-lg mb-6">
                Образование
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>ВУЗ</label>
                      <input
                        type="text"
                        value={d.university}
                        onChange={(e) => set("university", e.target.value)}
                        placeholder="Название учебного заведения"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">ВУЗ</div>
                      <div className="text-[#191A1B] text-base">
                        {d.university || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Год окончания</label>
                      <input
                        type="text"
                        value={d.graduationYear}
                        onChange={(e) => set("graduationYear", e.target.value)}
                        placeholder="ГГГГ"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Год окончания
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.graduationYear || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Интернатура</label>
                      <input
                        type="text"
                        value={d.internship}
                        onChange={(e) => set("internship", e.target.value)}
                        placeholder="Специальность"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Интернатура
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.internship || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <>
                      <label className={lbl}>Ординатура</label>
                      <input
                        type="text"
                        value={d.residency}
                        onChange={(e) => set("residency", e.target.value)}
                        placeholder="Специальность"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Ординатура
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.residency || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div className="col-span-2">
                  {isEditing ? (
                    <>
                      <label className={lbl}>Специализация по диплому</label>
                      <input
                        type="text"
                        value={d.diplomaSpecialty}
                        onChange={(e) =>
                          set("diplomaSpecialty", e.target.value)
                        }
                        placeholder="Введите специализацию"
                        className={inp}
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-[#838A8D] text-sm mb-1">
                        Специализация по диплому
                      </div>
                      <div className="text-[#191A1B] text-base">
                        {d.diplomaSpecialty || "—"}
                      </div>
                    </>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[#838A8D] text-sm">
                      Дополнительное образование
                    </div>
                    {isEditing && (
                      <button
                        onClick={() =>
                          set("additionalEducation", [
                            ...d.additionalEducation,
                            "",
                          ])
                        }
                        className="text-[#F5653E] text-sm font-medium flex items-center gap-1 hover:text-[#E5542D] transition-colors"
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
                        Добавить
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      {d.additionalEducation.length === 0 ? (
                        <div className="text-[#C4C8CA] text-sm px-4 py-3 rounded-2xl border border-dashed border-[#E5E6E8] text-center">
                          Нажмите «Добавить» для добавления записи
                        </div>
                      ) : (
                        d.additionalEducation.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
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
                              className={`${inp} flex-1`}
                            />
                            <button
                              onClick={() =>
                                set(
                                  "additionalEducation",
                                  d.additionalEducation.filter(
                                    (_, j) => j !== i,
                                  ),
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center text-[#C4C8CA] hover:text-[#F5653E] transition-colors shrink-0"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M12 4L4 12M4 4L12 12"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 mt-1">
                      {d.additionalEducation.length === 0 ? (
                        <div className="text-[#191A1B] text-base">—</div>
                      ) : (
                        d.additionalEducation.map((item, i) => (
                          <div key={i} className="text-[#191A1B] text-base">
                            {item}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Сертификаты и документы */}
            <div className="p-8">
              <h3 className="text-[#191A1B] font-semibold text-lg mb-6">
                Сертификаты и документы
              </h3>
              <div className="mb-6">
                {isEditing ? (
                  <>
                    <label className={lbl}>Номер лицензии</label>
                    <input
                      type="text"
                      value={d.licenseNumber}
                      onChange={(e) => set("licenseNumber", e.target.value)}
                      placeholder="ЛИЦ-XXXXXX"
                      className={inp}
                    />
                  </>
                ) : (
                  <>
                    <div className="text-[#838A8D] text-sm mb-1">
                      Номер лицензии
                    </div>
                    <div className="text-[#191A1B] text-base">
                      {d.licenseNumber || "—"}
                    </div>
                  </>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[#838A8D] text-sm">Сертификаты</div>
                  {isEditing && (
                    <>
                      <input
                        ref={certRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleCertUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => certRef.current?.click()}
                        className="text-[#F5653E] text-sm font-medium flex items-center gap-1 hover:text-[#E5542D] transition-colors"
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
                        Добавить
                      </button>
                    </>
                  )}
                </div>
                {certs.length === 0 ? (
                  <div className="text-[#C4C8CA] text-sm">
                    {isEditing
                      ? "Нажмите «Добавить» для загрузки сертификата"
                      : "—"}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {certs.map((cert, i) => (
                      <div
                        key={i}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#E5E6E8] bg-[#F8F9FA]"
                      >
                        <Image
                          src={cert}
                          alt={`Сертификат ${i + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        {isEditing && (
                          <button
                            onClick={() =>
                              setCerts((prev) => prev.filter((_, j) => j !== i))
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
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        icon={<TrashIcon />}
        title="Удалить специалиста?"
        description="Специалист будет удалён без возможности восстановления"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </div>
  );
}
