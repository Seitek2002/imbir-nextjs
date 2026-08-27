import { useSpecializationOptions } from "@/entities/specialization";

import { Dropdown, Input } from "@/shared/ui";

import type { DoctorFormData, InviteClinic } from "../model/types";

type Props = {
  data: DoctorFormData;
  inviteClinic?: InviteClinic;
  onChange: <K extends keyof DoctorFormData>(
    key: K,
    value: DoctorFormData[K],
  ) => void;
};

export const Step2Professional = ({ data, onChange, inviteClinic }: Props) => {
  // Список специализаций — из справочника бэка: значение уходит в
  // primary_specializations как есть, и по нему же врача потом находят фильтры.
  const { options, isLoading } = useSpecializationOptions("doctor");
  const placeholder = isLoading ? "Загружаем список..." : "Выберите из списка";

  return (
    <div className="flex flex-col gap-4">
      <Dropdown
        label="Специализация"
        placeholder={placeholder}
        options={options}
        isMulti
        searchable
        showSelectAll
        selectAllMode="select"
        value={data.specialization}
        onChange={(v) => onChange("specialization", v)}
      />
      <Dropdown
        label="Дополнительная специализация"
        placeholder={placeholder}
        options={options}
        isMulti
        searchable
        showSelectAll
        selectAllMode="select"
        value={data.additionalSpecialization}
        onChange={(v) => onChange("additionalSpecialization", v)}
      />
      <Input
        label="Стаж работы (лет)"
        autoComplete="off"
        type="number"
        placeholder="0"
        value={data.experience}
        onChange={(e) => onChange("experience", e.target.value)}
      />
      <Input
        label="Текущая должность"
        autoComplete="organization-title"
        placeholder="Введите должность"
        value={data.position}
        onChange={(e) => onChange("position", e.target.value)}
      />
      {inviteClinic ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-overlay">
            Место работы (клиника)
          </span>
          <div className="h-11 px-3 rounded-lg border border-border-soft bg-[#F7F8F9] flex items-center justify-between gap-2">
            <span className="text-sm text-foreground flex-1 truncate">
              {inviteClinic.clinicName}
              {inviteClinic.branchId && (
                <span className="text-muted ml-1">
                  — {inviteClinic.branchAddress}
                </span>
              )}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0 text-muted"
            >
              <rect
                x="4"
                y="1"
                width="6"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M2 9v3a1 1 0 001 1h8a1 1 0 001-1V9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M5 5h4M5 7h2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-xs text-muted">
            Заполнено клиникой при приглашении
          </p>
        </div>
      ) : (
        <Input
          label="Место работы (клиника)"
          autoComplete="organization"
          placeholder="Введите название клиники"
          value={data.workplace}
          onChange={(e) => onChange("workplace", e.target.value)}
        />
      )}
      <Input
        label="Категория/Квалификация"
        autoComplete="off"
        placeholder="Введите категорию/квалификацию"
        value={data.category}
        onChange={(e) => onChange("category", e.target.value)}
      />
      <Input
        label="Научная степень"
        autoComplete="off"
        placeholder="Введите научную степень"
        value={data.academicDegree}
        onChange={(e) => onChange("academicDegree", e.target.value)}
      />
    </div>
  );
};
