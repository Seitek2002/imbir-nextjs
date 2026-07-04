"use client";

import { FC, useEffect, useState } from "react";

import { DoctorPageLayout } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView, formStyles } from "@/widgets/doctor/layout";

import { Dropdown } from "@/shared/ui";

const { inp, lbl } = formStyles;

type D = {
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
  equipment: string;
  patientConditions: string;
  paymentMethods: string;
};

// "УЗИ, ЭКГ" → ["УЗИ", "ЭКГ"]
const csv = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const DoctorProfessionalInfoPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<D>({
    specialty: "",
    additionalSpecialty: "",
    experienceYears: "",
    currentPosition: "",
    workplace: "",
    qualification: "",
    scientificDegree: "",
    equipment: "",
    patientConditions: "",
    paymentMethods: "",
  });

  useEffect(() => {
    if (profile) {
      setD({
        specialty: profile.specialty,
        additionalSpecialty: profile.additionalSpecialty,
        experienceYears: profile.experienceYears,
        currentPosition: profile.currentPosition,
        workplace: profile.workplace,
        qualification: profile.qualification,
        scientificDegree: profile.scientificDegree,
        equipment: profile.equipment,
        patientConditions: profile.patientConditions,
        paymentMethods: profile.paymentMethods,
      });
    }
  }, [profile]);

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    // API использует primary/narrow_specializations (не specialty)
    await saveProfile({
      primary_specializations: d.specialty ? [d.specialty] : [],
      narrow_specializations: d.additionalSpecialty
        ? [d.additionalSpecialty]
        : [],
      experience_years: parseInt(d.experienceYears) || 0,
      additional_services: d.currentPosition || undefined,
      equipment: csv(d.equipment),
      patient_conditions: csv(d.patientConditions),
      payment_methods: csv(d.paymentMethods),
    });
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Профессиональные данные";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Профессиональные данные">
        <div className="flex items-center justify-center py-20 text-muted">
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
          <div className="lg:col-span-2">
            {isEditing ? (
              <>
                <label className={lbl}>Оборудование (через запятую)</label>
                <input
                  value={d.equipment}
                  onChange={(e) => set("equipment", e.target.value)}
                  placeholder="УЗИ, ЭКГ, Рентген"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Оборудование" value={d.equipment} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Условия приёма (через запятую)</label>
                <input
                  value={d.patientConditions}
                  onChange={(e) => set("patientConditions", e.target.value)}
                  placeholder="Приём детей, Приём на дому"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Условия приёма" value={d.patientConditions} />
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Способы оплаты (через запятую)</label>
                <input
                  value={d.paymentMethods}
                  onChange={(e) => set("paymentMethods", e.target.value)}
                  placeholder="Наличные, Карта, Перевод"
                  className={inp}
                />
              </>
            ) : (
              <FieldView label="Способы оплаты" value={d.paymentMethods} />
            )}
          </div>
        </div>
      </div>
    </DoctorPageLayout>
  );
};
