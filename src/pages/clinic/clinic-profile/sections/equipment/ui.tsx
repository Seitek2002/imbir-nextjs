"use client";

import { FC, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  getConditions,
  getEquipment,
  getPaymentMethods,
  referenceKeys,
} from "@/shared/api";
import { useReferenceValues } from "@/shared/lib/useReference";
import { Checkbox } from "@/shared/ui";

const DEFAULT_EQUIPMENT = [
  "УЗИ",
  "КТ/МРТ",
  "Операционная",
  "Рентген",
  "Лаборатория",
  "Реанимация",
];
const DEFAULT_PATIENT_CONDITIONS = [
  "Парковка",
  "Детская зона",
  "Онлайн-консультация",
  "Доступ для инвалидов",
  "Аптека",
];
const DEFAULT_PAYMENT_METHODS = ["Наличные", "Карта", "Онлайн"];

const OptionGroup: FC<{
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-secondary">{label}</span>
    <div className="divide-y divide-border rounded-xl border border-border">
      {options.map((option) => (
        <div key={option} className="px-4 py-3">
          <Checkbox
            label={option}
            checked={value.includes(option)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...value, option]
                  : value.filter((item) => item !== option),
              )
            }
          />
        </div>
      ))}
    </div>
  </div>
);

const BulletList: FC<{ label: string; items: string[] }> = ({
  label,
  items,
}) => (
  <div className="py-4 first:pt-0 last:pb-0">
    <div className="text-muted text-sm mb-2">{label}</div>
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li
          key={item}
          className="text-sm text-foreground flex items-center gap-2"
        >
          <span className="text-muted">–</span> {item}
        </li>
      ))}
    </ul>
  </div>
);

export const ClinicEquipmentPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [equipment, setEquipment] = useState<string[]>([]);
  const [patientConditions, setPatientConditions] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

  const { values: equipmentOptions } = useReferenceValues(
    referenceKeys.equipment(),
    getEquipment,
    DEFAULT_EQUIPMENT,
  );
  const { values: patientConditionOptions } = useReferenceValues(
    referenceKeys.conditions(),
    getConditions,
    DEFAULT_PATIENT_CONDITIONS,
  );
  const { values: paymentMethodOptions } = useReferenceValues(
    referenceKeys.paymentMethods(),
    getPaymentMethods,
    DEFAULT_PAYMENT_METHODS,
  );

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setEquipment(profile.equipment);
    setPatientConditions(profile.patientConditions);
    setPaymentMethods(profile.paymentMethods);
  }

  const handleSave = async () => {
    await saveProfile({
      equipment,
      patient_conditions: patientConditions,
      payment_methods: paymentMethods,
    });
    setIsEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <ClinicSectionPage
        title="Оборудование и условия"
        isEditing={false}
        onEditToggle={() => {}}
      >
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </ClinicSectionPage>
    );
  }

  return (
    <ClinicSectionPage
      title="Оборудование и условия"
      isEditing={isEditing}
      isSaving={isSaving}
      onEditToggle={() => (isEditing ? handleSave() : setIsEditing(true))}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        {isEditing ? (
          <div className="flex flex-col gap-6">
            <OptionGroup
              label="Оборудование"
              options={equipmentOptions}
              value={equipment}
              onChange={setEquipment}
            />
            <OptionGroup
              label="Условия для пациентов"
              options={patientConditionOptions}
              value={patientConditions}
              onChange={setPatientConditions}
            />
            <OptionGroup
              label="Способы оплаты"
              options={paymentMethodOptions}
              value={paymentMethods}
              onChange={setPaymentMethods}
            />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-background">
            <BulletList label="Оборудование" items={profile.equipment} />
            <BulletList
              label="Условия для пациентов"
              items={profile.patientConditions}
            />
            <BulletList label="Способы оплаты" items={profile.paymentMethods} />
          </div>
        )}
      </div>
    </ClinicSectionPage>
  );
};
