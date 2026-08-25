import { useSpecializationOptions } from "@/entities/specialization";

import { Dropdown, Textarea } from "@/shared/ui";

import type { ClinicFormData } from "../model/types";

type Props = {
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
};

export const Step5Specialization = ({ data, onChange }: Props) => {
  // Справочник бэка (GET /api/references/specializations/) — тот же список,
  // что и в кабинете клиники/врача. Выбор идёт по названию, резолвится в id
  // перед отправкой (см. handleSubmitClinic), поэтому опечатка или устаревшее
  // значение больше не могут молча потеряться, как было со свободным текстом.
  const { options: specializationOptions, isLoading: isSpecsLoading } =
    useSpecializationOptions();
  const specializationPlaceholder = isSpecsLoading
    ? "Загружаем список..."
    : "Выберите из списка";

  return (
    <div className="flex flex-col gap-4">
      <Dropdown
        label="Основные направления"
        placeholder={specializationPlaceholder}
        options={specializationOptions}
        isMulti
        searchable
        value={data.mainDirections}
        onChange={(v) => onChange("mainDirections", v)}
      />
      <Dropdown
        label="Узкие направления"
        placeholder={specializationPlaceholder}
        options={specializationOptions}
        isMulti
        searchable
        value={data.narrowDirections}
        onChange={(v) => onChange("narrowDirections", v)}
      />
      <Textarea
        label="Дополнительные услуги"
        placeholder="Анализы, УЗИ, Рентген..."
        rows={3}
        value={data.additionalServices}
        onChange={(e) => onChange("additionalServices", e.target.value)}
      />
    </div>
  );
};
