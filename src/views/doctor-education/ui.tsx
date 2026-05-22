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

const FieldView: FC<{ label: string; value: string | string[] }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[#838A8D] text-sm">{label}</p>
    {Array.isArray(value) ? (
      value.length === 0 ? (
        <p className="text-[#191A1B] font-medium text-base mt-0.5">—</p>
      ) : (
        value.map((v, i) => (
          <p key={i} className="text-[#191A1B] font-medium text-base mt-0.5">
            {v}
          </p>
        ))
      )
    ) : (
      <p className="text-[#191A1B] font-medium text-base mt-0.5">
        {value || "—"}
      </p>
    )}
  </div>
);

type EduData = Pick<
  DoctorProfileData,
  | "university"
  | "graduationYear"
  | "internship"
  | "residency"
  | "diplomaSpecialty"
  | "additionalEducation"
>;

export const DoctorEducationPage: FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<EduData>({
    university: MOCK_DOCTOR_PROFILE.university,
    graduationYear: MOCK_DOCTOR_PROFILE.graduationYear,
    internship: MOCK_DOCTOR_PROFILE.internship,
    residency: MOCK_DOCTOR_PROFILE.residency,
    diplomaSpecialty: MOCK_DOCTOR_PROFILE.diplomaSpecialty,
    additionalEducation: [...MOCK_DOCTOR_PROFILE.additionalEducation],
  });
  const doc = MOCK_DOCTOR_PROFILE;
  const set = <K extends keyof EduData>(k: K, v: EduData[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const title = isEditing ? "Редактировать" : "Образование";

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
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
                        onChange={(e) =>
                          set("diplomaSpecialty", e.target.value)
                        }
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#838A8D] text-sm">
                      Дополнительное образование
                    </p>
                    {isEditing && (
                      <button
                        onClick={() =>
                          set("additionalEducation", [
                            ...d.additionalEducation,
                            "",
                          ])
                        }
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
                        Добавить
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      {d.additionalEducation.length === 0 && (
                        <div className="text-[#C4C8CA] text-sm px-4 py-3 rounded-2xl border border-dashed border-[#E5E6E8] text-center">
                          Нажмите «Добавить»
                        </div>
                      )}
                      {d.additionalEducation.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
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
                            className="w-9 h-9 flex items-center justify-center text-[#C4C8CA] hover:text-[#F5653E] transition-colors"
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
                      ))}
                    </div>
                  ) : (
                    <FieldView label="" value={d.additionalEducation} />
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
