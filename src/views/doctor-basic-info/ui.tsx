"use client";

import { FC, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import {
  DoctorProfileData,
  MOCK_DOCTOR_PROFILE,
} from "@/entities/doctor-profile";

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18L9 12L15 6"
      stroke="#191A1B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M13 2a1.886 1.886 0 012.667 2.667L6.001 14.167 2.334 15.167l1-3.667L13 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M4 11L9 16L18 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const inp =
  "w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors bg-white";
const lbl = "block text-[#838A8D] text-sm mb-1.5";

type Field = { label: string; value: string };
const FieldView: FC<Field> = ({ label, value }) => (
  <div>
    <p className="text-[#838A8D] text-sm">{label}</p>
    <p className="text-[#191A1B] font-medium text-base mt-0.5">
      {value || "—"}
    </p>
  </div>
);

export const DoctorBasicInfoPage: FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<
    Pick<
      DoctorProfileData,
      | "fullName"
      | "gender"
      | "birthDate"
      | "city"
      | "languages"
      | "phone"
      | "email"
      | "photo"
    >
  >({
    fullName: MOCK_DOCTOR_PROFILE.fullName,
    gender: MOCK_DOCTOR_PROFILE.gender,
    birthDate: MOCK_DOCTOR_PROFILE.birthDate,
    city: MOCK_DOCTOR_PROFILE.city,
    languages: MOCK_DOCTOR_PROFILE.languages,
    phone: MOCK_DOCTOR_PROFILE.phone,
    email: MOCK_DOCTOR_PROFILE.email,
    photo: MOCK_DOCTOR_PROFILE.photo,
  });
  const photoRef = useRef<HTMLInputElement>(null);
  const doc = MOCK_DOCTOR_PROFILE;

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const title = isEditing ? "Редактировать" : "Основная информация";

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-base font-semibold text-[#191A1B]">{title}</h1>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isEditing ? "text-[#F5653E]" : "text-[#838A8D] hover:bg-[#F8F9FA]"}`}
        >
          {isEditing ? <CheckIcon /> : <PencilIcon />}
        </button>
      </div>

      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden lg:block">
          Мой профиль
        </h1>
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={doc.fullName}
              photo={doc.photo}
              specialty={doc.specialty}
              rating={doc.rating}
            />
          </div>

          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-[28px] font-semibold text-[#191A1B]">
                {title}
              </h2>
              <button
                onClick={() => setIsEditing((v) => !v)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${isEditing ? "bg-[#F5653E] text-white hover:bg-[#E5542D]" : "border border-[#E5E6E8] text-[#686F72] hover:bg-[#F8F9FA]"}`}
              >
                {isEditing ? (
                  <>
                    <CheckIcon /> Сохранить
                  </>
                ) : (
                  <>
                    <PencilIcon /> Редактировать
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E6E8] p-5 lg:p-8">
              {/* Photo */}
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
                        <PencilIcon />
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
                      <div className="flex gap-3">
                        {["Мужской", "Женский"].map((g) => (
                          <label
                            key={g}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${d.gender === g ? "border-[#F5653E]" : "border-[#C4C8CA]"}`}
                              onClick={() => set("gender", g)}
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
                    <>
                      <label className={lbl}>Телефон</label>
                      <input
                        type="tel"
                        value={d.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+996 500 000 000"
                        className={inp}
                      />
                    </>
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
          </main>
        </div>
      </div>
    </div>
  );
};
