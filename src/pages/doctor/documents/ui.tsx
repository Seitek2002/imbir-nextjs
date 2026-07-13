"use client";

import { FC, useRef, useState } from "react";

import Image from "next/image";

import { DoctorPageLayout } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView } from "@/widgets/doctor/layout";

import { Button, Input } from "@/shared/ui";

const AddIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M7 2V12M2 7H12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const DoctorDocumentsPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const certRef = useRef<HTMLInputElement>(null);

  // Синхронизация с профилем прямо в рендере («adjust state during render»).
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setLicenseNumber(profile.licenseNumber);
    setCerts(profile.certificates);
  }

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
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </Button>
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
                <Button
                  variant="text"
                  size="xs"
                  className="text-primary"
                  IconLeft={AddIcon}
                  onClick={() => certRef.current?.click()}
                >
                  Добавить документ
                </Button>
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
            <Input
              label="Номер лицензии"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="ЛИЦ-XXXXXX"
            />
          ) : (
            <FieldView label="Номер лицензии" value={licenseNumber} />
          )}
        </div>
      </div>
    </DoctorPageLayout>
  );
};
