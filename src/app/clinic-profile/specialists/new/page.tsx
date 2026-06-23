"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Dropdown } from "@/shared";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { useClinicCabinet } from "@/entities/clinic-profile";
import {
  EMPTY_SPECIALIST_FORM,
  type SpecialistFormData,
  useSpecialistsStore,
} from "@/entities/clinic-specialist";

import { colors } from "@/shared/config/tokens";
import { PhoneInput } from "@/shared/ui";

const inp =
  "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors bg-white";
const lbl = "block text-muted text-sm mb-1.5";

export default function NewSpecialistPage() {
  const router = useRouter();
  const { profile } = useClinicCabinet();
  const { add } = useSpecialistsStore();
  const [d, setD] = useState<SpecialistFormData>({ ...EMPTY_SPECIALIST_FORM });
  const [certs, setCerts] = useState<string[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullNameError, setFullNameError] = useState(false);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => clearTimeout(submitTimeoutRef.current);
  }, []);

  const set = <K extends keyof SpecialistFormData>(
    field: K,
    value: SpecialistFormData[K],
  ) => setD((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!d.fullName.trim()) {
      setFullNameError(true);
      return;
    }
    setFullNameError(false);
    setIsSubmitting(true);
    const newId = add({ ...d, certificates: certs });
    router.push(`/clinic-profile/specialists/${newId}`);
    // Safety: re-enable if navigation doesn't complete (component stays mounted)
    submitTimeoutRef.current = setTimeout(() => setIsSubmitting(false), 5000);
  };

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

  return (
    <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
      <h1 className="text-[40px] font-semibold text-foreground mb-8">
        Мой профиль
      </h1>

      <div className="flex gap-6">
        <ClinicSidebar
          clinicName={profile?.name ?? ""}
          clinicLogo={profile?.logo}
          rating={profile?.rating}
        />

        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors shrink-0"
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke={colors.foreground}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[28px] font-semibold text-foreground flex-1">
              Добавить специалиста
            </h2>

            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-full font-medium transition-colors shrink-0 ${
                isSubmitting
                  ? "bg-dim text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-border divide-y divide-border">
            {/* 1. Основная информация */}
            <div className="p-8">
              <h3 className="text-foreground font-semibold text-lg mb-6">
                Основная информация
              </h3>
              <div className="flex gap-8">
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <label className={lbl}>
                      ФИО <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={d.fullName}
                      onChange={(e) => {
                        set("fullName", e.target.value);
                        if (e.target.value.trim()) setFullNameError(false);
                      }}
                      placeholder="Введите ФИО"
                      className={`${inp} ${fullNameError ? "border-primary" : ""}`}
                    />
                    {fullNameError && (
                      <p className="text-primary text-xs mt-1">
                        Обязательное поле
                      </p>
                    )}
                  </div>

                  <div>
                    <Dropdown
                      label="Пол"
                      placeholder="Выберите"
                      options={[
                        { label: "Мужской", value: "Мужской" },
                        { label: "Женский", value: "Женский" },
                      ]}
                      value={d.gender}
                      onChange={(val) => set("gender", val)}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Дата рождения</label>
                    <input
                      type="text"
                      value={d.birthDate}
                      onChange={(e) => set("birthDate", e.target.value)}
                      placeholder="ДД.ММ.ГГГГ"
                      className={inp}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Город</label>
                    <input
                      type="text"
                      value={d.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Введите город"
                      className={inp}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Языки общения</label>
                    <input
                      type="text"
                      value={d.languages}
                      onChange={(e) => set("languages", e.target.value)}
                      placeholder="Русский, Английский"
                      className={inp}
                    />
                  </div>

                  <div>
                    <PhoneInput
                      label="Телефон"
                      value={d.phone}
                      onChange={(v) => set("phone", v)}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Почта</label>
                    <input
                      type="email"
                      value={d.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="example@mail.com"
                      className={inp}
                    />
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-3 pt-6">
                  <div className="w-30 h-30 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center">
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
                        <circle cx="24" cy="24" r="24" fill={colors.border} />
                        <path
                          d="M24 12C17.37 12 12 17.37 12 24s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 6c1.99 0 3.6 1.61 3.6 3.6S25.99 25.2 24 25.2s-3.6-1.61-3.6-3.6S22.01 18 24 18zm0 15.6c-3.2 0-6-.8-7.8-3.42.04-2.47 4.92-3.86 7.8-3.86 2.86 0 7.76 1.39 7.8 3.86C29.8 32.8 27.2 33.6 24 33.6z"
                          fill={colors.dim}
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="px-4 py-1.5 rounded-full border border-border text-secondary text-sm hover:bg-surface transition-colors"
                  >
                    Добавить фото
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Профессиональные данные */}
            <div className="p-8">
              <h3 className="text-foreground font-semibold text-lg mb-6">
                Профессиональные данные
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className={lbl}>Специализация</label>
                  <input
                    type="text"
                    value={d.specialty}
                    onChange={(e) => set("specialty", e.target.value)}
                    placeholder="Введите специализацию"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Дополнительная специализация</label>
                  <input
                    type="text"
                    value={d.additionalSpecialty}
                    onChange={(e) => set("additionalSpecialty", e.target.value)}
                    placeholder="Введите специализацию"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Стаж работы (лет)</label>
                  <input
                    type="number"
                    min="0"
                    value={d.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Текущая должность</label>
                  <input
                    type="text"
                    value={d.currentPosition}
                    onChange={(e) => set("currentPosition", e.target.value)}
                    placeholder="Введите должность"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Место работы (клиника)</label>
                  <input
                    type="text"
                    value={d.workplace}
                    onChange={(e) => set("workplace", e.target.value)}
                    placeholder="Название клиники"
                    className={inp}
                  />
                </div>

                <div>
                  <Dropdown
                    label="Категория / Квалификация"
                    placeholder="Выберите"
                    options={[
                      { label: "Высшая", value: "Высшая" },
                      { label: "Первая", value: "Первая" },
                      { label: "Вторая", value: "Вторая" },
                      { label: "Без категории", value: "Без категории" },
                    ]}
                    value={d.qualification}
                    onChange={(val) => set("qualification", val)}
                  />
                </div>

                <div className="col-span-2">
                  <label className={lbl}>Научная степень</label>
                  <input
                    type="text"
                    value={d.scientificDegree}
                    onChange={(e) => set("scientificDegree", e.target.value)}
                    placeholder="Введите степень"
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* 3. Образование */}
            <div className="p-8">
              <h3 className="text-foreground font-semibold text-lg mb-6">
                Образование
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className={lbl}>ВУЗ</label>
                  <input
                    type="text"
                    value={d.university}
                    onChange={(e) => set("university", e.target.value)}
                    placeholder="Название учебного заведения"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Год окончания</label>
                  <input
                    type="text"
                    value={d.graduationYear}
                    onChange={(e) => set("graduationYear", e.target.value)}
                    placeholder="ГГГГ"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Интернатура</label>
                  <input
                    type="text"
                    value={d.internship}
                    onChange={(e) => set("internship", e.target.value)}
                    placeholder="Специальность"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl}>Ординатура</label>
                  <input
                    type="text"
                    value={d.residency}
                    onChange={(e) => set("residency", e.target.value)}
                    placeholder="Специальность"
                    className={inp}
                  />
                </div>

                <div className="col-span-2">
                  <label className={lbl}>Специализация по диплому</label>
                  <input
                    type="text"
                    value={d.diplomaSpecialty}
                    onChange={(e) => set("diplomaSpecialty", e.target.value)}
                    placeholder="Введите специализацию"
                    className={inp}
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-muted text-sm">
                      Дополнительное образование
                    </div>
                    <button
                      onClick={() =>
                        set("additionalEducation", [
                          ...d.additionalEducation,
                          "",
                        ])
                      }
                      className="text-primary text-sm font-medium flex items-center gap-1 hover:text-primary-dark transition-colors"
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
                  </div>
                  <div className="space-y-2">
                    {d.additionalEducation.length === 0 ? (
                      <div className="text-dim text-sm px-4 py-3 rounded-2xl border border-dashed border-border text-center">
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
                                d.additionalEducation.filter((_, j) => j !== i),
                              )
                            }
                            className="w-9 h-9 flex items-center justify-center text-dim hover:text-primary transition-colors shrink-0"
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
                </div>
              </div>
            </div>

            {/* 4. Сертификаты и документы */}
            <div className="p-8">
              <h3 className="text-foreground font-semibold text-lg mb-6">
                Сертификаты и документы
              </h3>

              <div className="mb-6">
                <label className={lbl}>Номер лицензии</label>
                <input
                  type="text"
                  value={d.licenseNumber}
                  onChange={(e) => set("licenseNumber", e.target.value)}
                  placeholder="ЛИЦ-XXXXXX"
                  className={inp}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-muted text-sm">Сертификаты</div>
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
                      className="text-primary text-sm font-medium flex items-center gap-1 hover:text-primary-dark transition-colors"
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
                </div>
                {certs.length === 0 ? (
                  <div className="text-dim text-sm">
                    Нажмите «Добавить» для загрузки сертификата
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {certs.map((cert, i) => (
                      <div
                        key={i}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border bg-surface"
                      >
                        <Image
                          src={cert}
                          alt={`Сертификат ${i + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setCerts((prev) => prev.filter((_, j) => j !== i))
                          }
                          className="absolute top-0 right-0 w-1/2 aspect-square bg-primary flex items-center justify-center"
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
