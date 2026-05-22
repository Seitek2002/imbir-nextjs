"use client";

import { FC, useState } from "react";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import {
  FieldView,
  MOCK_DOCTOR_PROFILE,
  formStyles,
} from "@/entities/doctor-profile";

const { inp, lbl } = formStyles;

type D = {
  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string[];
};

export const DoctorEducationPage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<D>({
    university: MOCK_DOCTOR_PROFILE.university,
    graduationYear: MOCK_DOCTOR_PROFILE.graduationYear,
    internship: MOCK_DOCTOR_PROFILE.internship,
    residency: MOCK_DOCTOR_PROFILE.residency,
    diplomaSpecialty: MOCK_DOCTOR_PROFILE.diplomaSpecialty,
    additionalEducation: [...MOCK_DOCTOR_PROFILE.additionalEducation],
  });
  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const title = isEditing ? "Редактировать" : "Образование";

  return (
    <DoctorPageLayout
      title={title}
      editAction={isEditing ? "save" : "edit"}
      onEditToggle={() => setIsEditing((v) => !v)}
    >
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-[#191A1B]">{title}</h2>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${isEditing ? "bg-[#F5653E] text-white hover:bg-[#E5542D]" : "border border-[#E5E6E8] text-[#686F72] hover:bg-[#F8F9FA]"}`}
        >
          {isEditing ? "Сохранить" : "Редактировать"}
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#838A8D] text-sm">
                Дополнительное образование
              </p>
              {isEditing && (
                <button
                  onClick={() =>
                    set("additionalEducation", [...d.additionalEducation, ""])
                  }
                  className="text-[#F5653E] text-sm font-medium flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
    </DoctorPageLayout>
  );
};
