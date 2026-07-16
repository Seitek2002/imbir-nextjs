"use client";

import { FC, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import {
  FieldRow,
  FileIcon,
  toApiDate,
  useClinicCabinet,
} from "@/entities/clinic-profile";

import { Input } from "@/shared/ui";

export const ClinicLegalPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [legalName, setLegalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseDate, setLicenseDate] = useState("");
  const [licenseAuthority, setLicenseAuthority] = useState("");

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setLegalName(profile.legalName ?? "");
    setRegistrationNumber(profile.registrationNumber ?? "");
    setLicenseNumber(profile.licenseNumber ?? "");
    setLicenseDate(profile.licenseDate ?? "");
    setLicenseAuthority(profile.licenseAuthority ?? "");
  }

  const handleSave = async () => {
    await saveProfile({
      legal_name: legalName,
      reg_number: registrationNumber,
      license_number: licenseNumber,
      license_date: toApiDate(licenseDate),
      license_authority: licenseAuthority,
    });
    setIsEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <ClinicSectionPage
        title="Юридическая информация"
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
      title="Юридическая информация"
      isEditing={isEditing}
      isSaving={isSaving}
      onEditToggle={() => (isEditing ? handleSave() : setIsEditing(true))}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        {isEditing ? (
          <div className="flex flex-col gap-5">
            <Input
              label="Юридическое название"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
            <Input
              label="Регистрационный номер"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
            <Input
              label="Номер лицензии"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
            <Input
              label="Дата выдачи лицензии"
              value={licenseDate}
              onChange={(e) => setLicenseDate(e.target.value)}
              placeholder="ГГГГ-ММ-ДД"
            />
            <Input
              label="Орган, выдавший лицензию"
              value={licenseAuthority}
              onChange={(e) => setLicenseAuthority(e.target.value)}
            />
            <div>
              <label className="block text-secondary text-sm mb-2">
                Документы (лицензии, регистрационные документы)
              </label>
              <div className="flex flex-wrap gap-4">
                {profile.documents.map((doc, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <FileIcon />
                    <span className="text-xs text-secondary max-w-20 text-center truncate">
                      {doc.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">
                Загрузка документов — в разработке
              </p>
            </div>
          </div>
        ) : (
          <div>
            <FieldRow label="Юридическое название">
              {profile.legalName}
            </FieldRow>
            <FieldRow label="Регистрационный номер">
              {profile.registrationNumber}
            </FieldRow>
            <FieldRow label="Номер лицензии">{profile.licenseNumber}</FieldRow>
            <FieldRow label="Дата выдачи лицензии">
              {profile.licenseDate}
            </FieldRow>
            <FieldRow label="Орган, выдавший лицензию">
              {profile.licenseAuthority}
            </FieldRow>
            <div className="pt-3">
              <div className="text-muted text-sm mb-2">
                Документы (лицензии, регистрационные документы)
              </div>
              <div className="flex flex-wrap gap-4">
                {profile.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <FileIcon />
                    <span className="text-xs text-secondary max-w-20 text-center truncate">
                      {doc.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ClinicSectionPage>
  );
};
