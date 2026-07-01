"use client";

import { FC, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { DoctorPageLayout } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView, formStyles } from "@/widgets/doctor/layout";

import { colors } from "@/shared/config";

const { inp } = formStyles;

const FileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill={colors.surface} />
    <path
      d="M20 6H11C10.4696 6 9.96086 6.21071 9.58579 6.58579C9.21071 6.96086 9 7.46957 9 8V24C9 24.5304 9.21071 25.0391 9.58579 25.4142C9.96086 25.7893 10.4696 26 11 26H21C21.5304 26 22.0391 25.7893 22.4142 25.4142C22.7893 25.0391 23 24.5304 23 24V9L20 6Z"
      stroke={colors.muted}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 6V9H23M13 16H19M13 20H19"
      stroke={colors.muted}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoctorDocumentsPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const certRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setLicenseNumber(profile.licenseNumber);
      setCerts(profile.certificates);
    }
  }, [profile]);

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setCerts((prev) => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // API хранит номер лицензии плоским полем (объекта legal нет).
    // Файлы сертификатов (certs) профиль-эндпоинт не принимает.
    await saveProfile({
      license_number: licenseNumber,
    });
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Сертификаты и документы";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Сертификаты и документы">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </DoctorPageLayout>
    );
  }

  return (
    <DoctorPageLayout
      title={title}
      editAction={isEditing ? "save" : "edit"}
      onEditToggle={isEditing ? handleSave : () => setIsEditing(true)}
    >
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-60 ${isEditing ? "bg-primary text-white hover:bg-primary-dark" : "border border-border text-secondary hover:bg-surface"}`}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-muted text-sm">Сертификаты</p>
            {isEditing && (
              <>
                <input
                  ref={certRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCertUpload}
                  className="hidden"
                />
                <button
                  onClick={() => certRef.current?.click()}
                  className="text-primary text-sm font-medium flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 2V12M2 7H12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Добавить документ
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {certs.length === 0 ? (
              <div className="text-dim text-sm py-2">
                Нет загруженных документов
              </div>
            ) : null}
            {certs.map((cert, i) => (
              <div
                key={i}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-surface"
              >
                <Image
                  src={cert}
                  alt={`cert-${i}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <button
                    onClick={() =>
                      setCerts((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="absolute top-0 right-0 w-1/2 aspect-square bg-primary flex items-center justify-center"
                  >
                    <svg className="w-1/2 h-1/2" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {isEditing && certs.length === 0 && (
              <button
                onClick={() => certRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-dim hover:border-primary hover:text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          {isEditing ? (
            <>
              <label className={formStyles.lbl}>Номер лицензии</label>
              <input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="ЛИЦ-XXXXXX"
                className={inp}
              />
            </>
          ) : (
            <FieldView label="Номер лицензии" value={licenseNumber} />
          )}
        </div>
      </div>
    </DoctorPageLayout>
  );
};
