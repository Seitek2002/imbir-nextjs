"use client";

import { FC, useState } from "react";

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

const FieldView: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[#838A8D] text-sm">{label}</p>
    <p className="text-[#191A1B] font-medium text-base mt-0.5">
      {value || "—"}
    </p>
  </div>
);

const SelectField: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className={lbl}>{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inp} appearance-none pr-10`}
      >
        <option value="">Выберите</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
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
    </div>
  </div>
);

type ProfData = Pick<
  DoctorProfileData,
  | "specialty"
  | "additionalSpecialty"
  | "experienceYears"
  | "currentPosition"
  | "workplace"
  | "qualification"
  | "scientificDegree"
>;

export const DoctorProfessionalInfoPage: FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<ProfData>({
    specialty: MOCK_DOCTOR_PROFILE.specialty,
    additionalSpecialty: MOCK_DOCTOR_PROFILE.additionalSpecialty,
    experienceYears: MOCK_DOCTOR_PROFILE.experienceYears,
    currentPosition: MOCK_DOCTOR_PROFILE.currentPosition,
    workplace: MOCK_DOCTOR_PROFILE.workplace,
    qualification: MOCK_DOCTOR_PROFILE.qualification,
    scientificDegree: MOCK_DOCTOR_PROFILE.scientificDegree,
  });
  const doc = MOCK_DOCTOR_PROFILE;
  const set = <K extends keyof ProfData>(k: K, v: ProfData[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const title = isEditing ? "Редактировать" : "Профессиональные данные";

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-base font-semibold text-[#191A1B] truncate mx-2">
          {title}
        </h1>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  {isEditing ? (
                    <SelectField
                      label="Специализация"
                      value={d.specialty}
                      onChange={(v) => set("specialty", v)}
                      options={[
                        "Терапевт",
                        "Кардиолог",
                        "Хирург",
                        "Педиатр",
                        "Невролог",
                      ]}
                    />
                  ) : (
                    <FieldView label="Специализация" value={d.specialty} />
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <SelectField
                      label="Дополнительная специализация"
                      value={d.additionalSpecialty}
                      onChange={(v) => set("additionalSpecialty", v)}
                      options={["Кардиолог", "Терапевт", "Хирург", "Педиатр"]}
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
                    <FieldView
                      label="Стаж работы, лет"
                      value={d.experienceYears}
                    />
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
                    <SelectField
                      label="Место работы (клиника)"
                      value={d.workplace}
                      onChange={(v) => set("workplace", v)}
                      options={["k-MEO", "Городская больница", "Медцентр"]}
                    />
                  ) : (
                    <FieldView
                      label="Место работы (клиника)"
                      value={d.workplace}
                    />
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <SelectField
                      label="Категория / Квалификация"
                      value={d.qualification}
                      onChange={(v) => set("qualification", v)}
                      options={["Высшая", "Первая", "Вторая", "Без категории"]}
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
                    <>
                      <label className={lbl}>Научная степень</label>
                      <input
                        value={d.scientificDegree}
                        onChange={(e) =>
                          set("scientificDegree", e.target.value)
                        }
                        placeholder="Введите степень"
                        className={inp}
                      />
                    </>
                  ) : (
                    <FieldView
                      label="Научная степень"
                      value={d.scientificDegree}
                    />
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
