"use client";

import {
  getConditions,
  getEquipment,
  getPaymentMethods,
  referenceKeys,
} from "@/shared/api";
import { useReferenceValues } from "@/shared/lib/useReference";

import {
  DEFAULT_EQUIPMENT,
  DEFAULT_PATIENT_CONDITIONS,
  DEFAULT_PAYMENT_METHODS,
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

export const Step6Equipment = ({ data, onChange }: Props) => {
  // Все три списка — из справочников бэка поверх наборов по умолчанию: клиники
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
  const { values: paymentMethods } = useReferenceValues(
    referenceKeys.paymentMethods(),
    getPaymentMethods,
    DEFAULT_PAYMENT_METHODS,
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
      <CheckboxGroup
        label="Способы оплаты"
        options={paymentMethods}
        value={data.paymentMethods}
        onChange={(v) => onChange("paymentMethods", v)}
      />
    </div>
  );
};
