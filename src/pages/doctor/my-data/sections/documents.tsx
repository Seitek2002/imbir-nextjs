"use client";

import { FC, useRef, useState } from "react";

import { DoctorPageLayout, useMyDataTabs } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView } from "@/widgets/doctor/layout";

import { CheckIcon } from "@/shared/assets/icons";
import { MAX_DOCUMENT_MB, isFileSizeAllowed } from "@/shared/lib/files";
import {
  Button,
  CancelEditButton,
  ConfirmDialog,
  ImageWithFallback,
  Input,
} from "@/shared/ui";

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

export const DoctorDocumentsSection: FC = () => {
  const {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    documents,
    uploadDocument,
    deleteDocument,
    isUploadingDocument,
  } = useDoctorCabinet();
  const { setActive } = useMyDataTabs();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const certRef = useRef<HTMLInputElement>(null);

  // Синхронизация с профилем прямо в рендере («adjust state during render»).
  // Инициализируем трекер именно null, а не текущим profile: макет кабинета
  // (DoctorPageLayoutSkeleton) держит тот же запрос смонтированным, поэтому при
  // переходе между вкладками страница монтируется, когда профиль уже в кеше.
  // С useState(profile) первый же рендер записывал его в трекер, условие ниже
  // не срабатывало никогда — и форма оставалась пустой.
  const [syncedProfile, setSyncedProfile] = useState<typeof profile>(null);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setLicenseNumber(profile.licenseNumber);
    setCerts([...profile.certificates]);
  }

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !isFileSizeAllowed(file, MAX_DOCUMENT_MB)) return;
    // Файл уходит сразу: копить их в стейте нельзя — профильный endpoint
    // сертификаты не принимает, и «Сохранить» их бы не отправило.
    await uploadDocument(file);
  };

  const handleSave = async () => {
    // API хранит номер лицензии плоским полем (объекта legal нет).
    // Файлы сертификатов (certs) профиль-эндпоинт не принимает.
    await saveProfile({
      license_number: licenseNumber,
    });
    setIsEditing(false);
    setShowSaveConfirm(false);
  };

  const handleCancel = () => {
    if (profile) {
      setLicenseNumber(profile.licenseNumber);
      setCerts([...profile.certificates]);
    }
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Сертификаты и документы";

  if (isLoading) {
    return (
      <DoctorPageLayout
        title="Сертификаты и документы"
        onBack={() => setActive(null)}
      >
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
      onEditToggle={
        isEditing ? () => setShowSaveConfirm(true) : () => setIsEditing(true)
      }
      onBack={isEditing ? handleCancel : () => setActive(null)}
    >
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          {isEditing && (
            <CancelEditButton onClick={handleCancel} disabled={isSaving} />
          )}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={
              isEditing
                ? () => setShowSaveConfirm(true)
                : () => setIsEditing(true)
            }
            disabled={isSaving}
          >
            {isSaving
              ? "Сохранение..."
              : isEditing
                ? "Сохранить"
                : "Редактировать"}
          </Button>
        </div>
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
                  loading={isUploadingDocument}
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
                key={documents[i]?.id ?? cert}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-surface"
              >
                <a
                  href={cert}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Скачать сертификат ${i + 1}`}
                  title="Скачать сертификат"
                  className="block w-full h-full cursor-pointer"
                >
                  <ImageWithFallback
                    src={cert}
                    alt={`cert-${i}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-dim">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M4 3h9l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13 3v3h3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    }
                  />
                </a>
                {isEditing && (
                  <button
                    onClick={() => {
                      const id = documents[i]?.id;
                      if (id !== undefined) void deleteDocument(id);
                    }}
                    className="absolute top-0 right-0 z-10 w-1/2 aspect-square bg-primary flex items-center justify-center"
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
                disabled={isUploadingDocument}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-dim hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
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

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные профиля будут сохранены"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
        isLoading={isSaving}
        closeOnConfirm={false}
      />
    </DoctorPageLayout>
  );
};
