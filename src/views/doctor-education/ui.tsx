"use client";

import { FC, useEffect, useState } from "react";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import {
  FieldView,
  formStyles,
  useDoctorCabinet,
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
  const { profile, isLoading, isSaving, saveProfile, rawProfile } =
    useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<D>({
    university: "",
    graduationYear: "",
    internship: "",
    residency: "",
    diplomaSpecialty: "",
    additionalEducation: [],
  });

  useEffect(() => {
    if (profile) {
      setD({
        university: profile.university,
        graduationYear: profile.graduationYear,
        internship: profile.internship,
        residency: profile.residency,
        diplomaSpecialty: profile.diplomaSpecialty,
        additionalEducation: [...profile.additionalEducation],
      });
    }
  }, [profile]);

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
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
      education: [...mainEdu, ...addEdu],
    });
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Образование";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Образование">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </DoctorPageLayout>
    );
  }

  // suppress unused var warning — rawProfile used for future extension
  void rawProfile;

  return (
    <DoctorPageLayout
      title={title}
      editAction={isEditing ? "save" : "edit"}
      onEditToggle={isEditing ? handleSave : () => setIsEditing(true)}
    >
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-60 ${isEditing ? "bg-primary text-white hover:bg-primary-dark" : "border border-border text-secondary hover:bg-surface"}`}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8">
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
              <p className="text-muted text-sm">Дополнительное образование</p>
              {isEditing && (
                <button
                  onClick={() =>
                    set("additionalEducation", [...d.additionalEducation, ""])
                  }
                  className="text-primary text-sm font-medium flex items-center gap-1"
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
                  <div className="text-dim text-sm px-4 py-3 rounded-2xl border border-dashed border-border text-center">
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
                      className="w-9 h-9 flex items-center justify-center text-dim hover:text-primary transition-colors"
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
