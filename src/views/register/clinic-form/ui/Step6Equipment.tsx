import {
  EQUIPMENT_OPTIONS,
  PATIENT_CONDITIONS,
  PAYMENT_OPTIONS,
} from "../model/constants";
import type { ClinicFormData } from "../model/types";
import { CheckboxGroup } from "./CheckboxGroup";

type Props = {
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
};

export const Step6Equipment = ({ data, onChange }: Props) => (
  <div className="flex flex-col gap-5">
    <CheckboxGroup
      label="Оборудование"
      options={EQUIPMENT_OPTIONS}
      value={data.equipment}
      onChange={(v) => onChange("equipment", v)}
    />
    <CheckboxGroup
      label="Условия для пациентов"
      options={PATIENT_CONDITIONS}
      value={data.patientConditions}
      onChange={(v) => onChange("patientConditions", v)}
    />
    <CheckboxGroup
      label="Способы оплаты"
      options={PAYMENT_OPTIONS}
      value={data.paymentMethods}
      onChange={(v) => onChange("paymentMethods", v)}
    />
  </div>
);
