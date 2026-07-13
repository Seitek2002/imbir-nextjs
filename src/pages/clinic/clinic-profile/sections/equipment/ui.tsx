"use client";

import { FC, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { csv, useClinicCabinet } from "@/entities/clinic-profile";

import { Textarea } from "@/shared/ui";

const BulletList: FC<{ label: string; items: string[] }> = ({
  label,
  items,
}) => (
  <div>
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

  const [equipment, setEquipment] = useState("");
  const [patientConditions, setPatientConditions] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setEquipment(profile.equipment.join(", "));
    setPatientConditions(profile.patientConditions.join(", "));
    setPaymentMethods(profile.paymentMethods.join(", "));
  }

  const handleSave = async () => {
    await saveProfile({
      equipment: csv(equipment),
      patient_conditions: csv(patientConditions),
      payment_methods: csv(paymentMethods),
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
            <Textarea
              label="Оборудование"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              rows={2}
              hint="Введите через запятую"
            />
            <Textarea
              label="Условия для пациентов"
              value={patientConditions}
              onChange={(e) => setPatientConditions(e.target.value)}
              rows={2}
              hint="Введите через запятую"
            />
            <Textarea
              label="Способы оплаты"
              value={paymentMethods}
              onChange={(e) => setPaymentMethods(e.target.value)}
              rows={2}
              hint="Введите через запятую"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
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
