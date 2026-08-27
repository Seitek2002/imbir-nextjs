"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { useClinicCabinet } from "@/entities/clinic-profile";

import { getConditions, getEquipment, referenceKeys } from "@/shared/api";
import { Dropdown } from "@/shared/ui";
import type { DropdownOption } from "@/shared/ui/dropdown";

const withSelected = (
  options: string[],
  selected: string[],
): DropdownOption[] => {
  const known = new Set(options);
  return [
    ...options.map((value) => ({ label: value, value })),
    ...selected
      .filter((value) => !known.has(value))
      .map((value) => ({ label: value, value })),
  ];
};

const BulletList: FC<{ items: string[]; label: string }> = ({
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
  // Поля «Способы оплаты» в интерфейсе больше нет — оплата у всех только
  // онлайн. Значение продолжаем читать и отправлять обратно как есть: PUT
  // /api/clinic/profile/ затирает всё, чего нет в теле запроса, так что без
  // этого сохранение раздела молча стёрло бы данные у существующих клиник.
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

  const { data: equipmentOptions = [], isLoading: isEquipmentLoading } =
    useQuery({
      queryKey: referenceKeys.equipment(),
      queryFn: getEquipment,
      staleTime: 60 * 60 * 1000,
    });
  const { data: patientConditionOptions = [], isLoading: isConditionsLoading } =
    useQuery({
      queryKey: referenceKeys.conditions(),
      queryFn: getConditions,
      staleTime: 60 * 60 * 1000,
    });
  const placeholder =
    isEquipmentLoading || isConditionsLoading
      ? "Загружаем список..."
      : "Выберите из списка";

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
            <Dropdown
              label="Оборудование"
              placeholder={placeholder}
              options={withSelected(equipmentOptions, equipment)}
              value={equipment}
              onChange={setEquipment}
              isMulti
              searchable
              type="checkbox"
            />
            <Dropdown
              label="Условия для пациентов"
              placeholder={placeholder}
              options={withSelected(patientConditionOptions, patientConditions)}
              value={patientConditions}
              onChange={setPatientConditions}
              isMulti
              searchable
              type="checkbox"
            />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-background">
            <BulletList label="Оборудование" items={profile.equipment} />
            <BulletList
              label="Условия для пациентов"
              items={profile.patientConditions}
            />
          </div>
        )}
      </div>
    </ClinicSectionPage>
  );
};
