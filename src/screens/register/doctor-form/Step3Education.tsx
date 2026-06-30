import { Input, Textarea } from "@/shared/ui";

import type { DoctorFormData } from "../model/types";

type Props = {
  data: DoctorFormData;
  onChange: <K extends keyof DoctorFormData>(
    key: K,
    value: DoctorFormData[K],
  ) => void;
};

export const Step3Education = ({ data, onChange }: Props) => (
  <div className="flex flex-col gap-4">
    <Input
      label="ВУЗ"
      placeholder="Введите название"
      value={data.university}
      onChange={(e) => onChange("university", e.target.value)}
    />
    <Input
      label="Год окончания"
      placeholder="ГГГГ"
      value={data.graduationYear}
      onChange={(e) => onChange("graduationYear", e.target.value)}
    />
    <Input
      label="Интернатура"
      placeholder="Введите интернатуру"
      value={data.internship}
      onChange={(e) => onChange("internship", e.target.value)}
    />
    <Input
      label="Ординатура"
      placeholder="Введите ординатуру"
      value={data.residency}
      onChange={(e) => onChange("residency", e.target.value)}
    />
    <Input
      label="Специализация по диплому"
      placeholder="Введите специализацию по диплому"
      value={data.diplomaSpecialization}
      onChange={(e) => onChange("diplomaSpecialization", e.target.value)}
    />
    <Textarea
      label="Дополнительное образование"
      placeholder="Курсы повышения квалификации, сертификаты..."
      value={data.additionalEducation}
      onChange={(e) => onChange("additionalEducation", e.target.value)}
    />
  </div>
);
