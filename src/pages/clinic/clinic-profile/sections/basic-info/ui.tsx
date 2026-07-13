"use client";

import { FC, useRef, useState } from "react";

import Image from "next/image";

import { useClinicCabinet } from "@/entities/clinic-profile";
import { FieldRow, UploadIcon } from "@/entities/clinic-profile";

import { Button, Input, Textarea } from "@/shared/ui";

import { ClinicSectionPage } from "../../section-page";

export const ClinicBasicInfoPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setName(profile.name ?? "");
    setType(profile.type ?? "");
    setDescription(profile.description ?? "");
    setLogoPreview(profile.logo);
  }

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await saveProfile({
      name,
      clinic_type: type,
      description,
      ...(logoFile ? { logo: logoFile } : {}),
    });
    setLogoFile(null);
    setIsEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <ClinicSectionPage
        title="Основная информация"
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
      title="Основная информация"
      isEditing={isEditing}
      isSaving={isSaving}
      onEditToggle={() => (isEditing ? handleSave() : setIsEditing(true))}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        {isEditing ? (
          <div className="flex flex-col gap-5">
            <Input
              label="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-secondary text-sm mb-2">
                Логотип
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogo}
              />
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      width={96}
                      height={96}
                      sizes="96px"
                      unoptimized={logoPreview.startsWith("data:")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  IconLeft={UploadIcon}
                  onClick={() => logoInputRef.current?.click()}
                >
                  Новый логотип
                </Button>
              </div>
            </div>

            <Input
              label="Тип клиники"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />

            <Textarea
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        ) : (
          <div>
            <FieldRow label="Название">{profile.name}</FieldRow>

            <div className="py-3 border-b border-background">
              <div className="text-muted text-sm mb-2">Логотип</div>
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                {profile.logo ? (
                  <Image
                    src={profile.logo}
                    alt="Logo"
                    width={96}
                    height={96}
                    sizes="96px"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            <FieldRow label="Тип">{profile.type}</FieldRow>
            <FieldRow label="Описание">{profile.description}</FieldRow>

            {profile.photos.length > 0 && (
              <div className="pt-3">
                <div className="text-muted text-sm mb-2">Фотографии</div>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {profile.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0"
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ClinicSectionPage>
  );
};
