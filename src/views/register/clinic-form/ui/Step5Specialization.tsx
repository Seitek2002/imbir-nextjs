import { Textarea } from "@/shared/ui";

import type { ClinicFormData } from "../model/types";

type Props = {
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
};

export const Step5Specialization = ({ data, onChange }: Props) => (
  <div className="flex flex-col gap-4">
    <Textarea
      label="Основные направления"
      placeholder="Терапия, Кардиология, Педиатрия..."
      rows={3}
      value={data.mainDirections}
      onChange={(e) => onChange("mainDirections", e.target.value)}
    />
    <Textarea
      label="Узкие направления"
      placeholder="Эндокринолог, Невролог, Офтальмолог..."
      rows={3}
      value={data.narrowDirections}
      onChange={(e) => onChange("narrowDirections", e.target.value)}
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
