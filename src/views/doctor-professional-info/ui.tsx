"use client";

import { FC, useState } from "react";

import { Dropdown } from "@/shared";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import {
  FieldView,
  MOCK_DOCTOR_PROFILE,
  formStyles,
} from "@/entities/doctor-profile";

const { inp, lbl } = formStyles;

type D = {
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
};

export const DoctorProfessionalInfoPage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<D>({
    specialty: MOCK_DOCTOR_PROFILE.specialty,
    additionalSpecialty: MOCK_DOCTOR_PROFILE.additionalSpecialty,
    experienceYears: MOCK_DOCTOR_PROFILE.experienceYears,
    currentPosition: MOCK_DOCTOR_PROFILE.currentPosition,
    workplace: MOCK_DOCTOR_PROFILE.workplace,
    qualification: MOCK_DOCTOR_PROFILE.qualification,
    scientificDegree: MOCK_DOCTOR_PROFILE.scientificDegree,
  });
  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const title = isEditing ? "Редактировать" : "Профессиональные данные";

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
              <FieldView label="Текущая должность" value={d.currentPosition} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Dropdown
                label="Место работы (клиника)"
                placeholder="Выберите"
                options={["k-MEO", "Городская больница", "Медцентр"].map(
                  (o) => ({ label: o, value: o }),
                )}
                value={d.workplace}
                onChange={(v) => set("workplace", v)}
              />
            ) : (
              <FieldView label="Место работы (клиника)" value={d.workplace} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Dropdown
                label="Категория / Квалификация"
                placeholder="Выберите"
                options={["Высшая", "Первая", "Вторая", "Без категории"].map(
                  (o) => ({ label: o, value: o }),
                )}
                value={d.qualification}
                onChange={(v) => set("qualification", v)}
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
      </div>
    </DoctorPageLayout>
  );
};
