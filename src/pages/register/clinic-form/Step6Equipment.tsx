"use client";

import { getConditions, getEquipment, referenceKeys } from "@/shared/api";
import { useReferenceValues } from "@/shared/lib/useReference";

import {
  DEFAULT_EQUIPMENT,
  DEFAULT_PATIENT_CONDITIONS,
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

// Способов оплаты здесь больше нет — оплата у всех только онлайн, выбирать
// не из чего. Значение проставляется константой CLINIC_PAYMENT_METHODS в
// начальном состоянии формы (clinic-form/ui.tsx) и уходит в step6 как есть.
export const Step6Equipment = ({ data, onChange }: Props) => {
  // Оба списка — из справочников бэка поверх наборов по умолчанию: клиники
  // уже завели там реальные позиции («Фиброскан», «HILT-лазер», «BTL
  // магнитотерапия»), которых в захардкоженном списке не было.
  const { values: equipment } = useReferenceValues(
    referenceKeys.equipment(),
    getEquipment,
    DEFAULT_EQUIPMENT,
  );
  const { values: conditions } = useReferenceValues(
    referenceKeys.conditions(),
    getConditions,
    DEFAULT_PATIENT_CONDITIONS,
  );

  return (
    <div className="flex flex-col gap-5">
      <CheckboxGroup
        label="Оборудование"
        options={equipment}
        value={data.equipment}
        onChange={(v) => onChange("equipment", v)}
      />
      <CheckboxGroup
        label="Условия для пациентов"
        options={conditions}
        value={data.patientConditions}
        onChange={(v) => onChange("patientConditions", v)}
      />
    </div>
  );
};
