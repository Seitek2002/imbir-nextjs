"use client";

import { FC, useRef, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import {
  FieldRow,
  FileIcon,
  UploadIcon,
  toApiDate,
  useClinicCabinet,
} from "@/entities/clinic-profile";

import { maskDate } from "@/shared/lib/utils";
import { Input } from "@/shared/ui";

export const ClinicLegalPage: FC = () => {
  const {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    documentItems,
    uploadDocument,
    deleteDocument,
    isUploadingDocument,
  } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const documentsInputRef = useRef<HTMLInputElement>(null);

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

  const handleDocuments = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    await Promise.all(files.map((file) => uploadDocument(file)));
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
              onChange={(e) => setLicenseDate(maskDate(e.target.value))}
              placeholder="ДД.ММ.ГГГГ"
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
              <input
                ref={documentsInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,image/*"
                className="sr-only"
                onChange={handleDocuments}
              />
              <div className="rounded-2xl border-2 border-dashed border-border p-4">
                {documentItems.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {documentItems.map((document) => (
                      <div
                        key={document.id}
                        className="relative flex flex-col items-center gap-1"
                      >
                        <FileIcon />
                        <span className="max-w-24 truncate text-center text-xs text-secondary">
                          {document.url.split("/").pop() || "Документ"}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteDocument(document.id)}
                          className="absolute -right-2 -top-2 size-5 rounded-full bg-foreground text-xs leading-none text-white"
                          aria-label="Удалить документ"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => documentsInputRef.current?.click()}
                      disabled={isUploadingDocument}
                      className="flex size-8 items-center justify-center self-start rounded-full border-2 border-dashed border-border text-xl text-primary hover:border-primary/40 disabled:opacity-50"
                      aria-label="Добавить документ"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => documentsInputRef.current?.click()}
                    disabled={isUploadingDocument}
                    className="flex min-h-20 w-full items-center justify-center gap-2 text-sm font-medium text-secondary disabled:opacity-50"
                  >
                    <UploadIcon className="size-7 text-primary" />
                    {isUploadingDocument
                      ? "Загрузка..."
                      : "Загрузить документы"}
                  </button>
                )}
              </div>
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
                {documentItems.map((document) => (
                  <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <FileIcon />
                    <span className="text-xs text-secondary max-w-20 text-center truncate">
                      {document.url.split("/").pop() || "Документ"}
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
