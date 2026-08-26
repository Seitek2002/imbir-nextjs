"use client";

import { FC, useRef, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { useClinicCabinet } from "@/entities/clinic-profile";
import { FieldRow, UploadIcon } from "@/entities/clinic-profile";

import { getClinicTypes, referenceKeys } from "@/shared/api";
import { DEFAULT_CLINIC_TYPES } from "@/shared/config";
import { useReferenceOptions } from "@/shared/lib/useReference";
import {
  Button,
  Dropdown,
  ImageWithFallback,
  Input,
  PhotoLightbox,
  Textarea,
} from "@/shared/ui";

export const ClinicBasicInfoPage: FC = () => {
  const {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    photoItems,
    uploadPhoto,
    deletePhoto,
    isUploadingPhoto,
  } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [openPhoto, setOpenPhoto] = useState<null | string>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const { options: clinicTypeOptions } = useReferenceOptions(
    referenceKeys.clinicTypes(),
    getClinicTypes,
    DEFAULT_CLINIC_TYPES,
  );

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

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    await Promise.all(files.map((file) => uploadPhoto(file)));
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
                    <ImageWithFallback
                      src={logoPreview}
                      alt="Logo"
                      width={96}
                      height={96}
                      sizes="96px"
                      unoptimized={logoPreview.startsWith("data:")}
                      className="w-full h-full object-cover"
                      fallback={
                        <span className="text-white text-4xl font-bold">
                          {name.charAt(0)}
                        </span>
                      }
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

            <Dropdown
              label="Тип клиники"
              placeholder="Выберите из списка"
              options={clinicTypeOptions}
              value={type}
              onChange={setType}
            />

            <Textarea
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />

            <div>
              <label className="block text-secondary text-sm mb-2">
                Фотографии клиники
              </label>
              <input
                ref={photosInputRef}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={handlePhotos}
              />
              <div className="rounded-2xl border-2 border-dashed border-border p-3">
                {photoItems.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {photoItems.map((photo) => (
                      <div key={photo.id} className="relative size-20">
                        <button
                          type="button"
                          onClick={() => setOpenPhoto(photo.url)}
                          className="size-full cursor-pointer"
                        >
                          <ImageWithFallback
                            src={photo.url}
                            alt="Фотография клиники"
                            width={80}
                            height={80}
                            sizes="80px"
                            className="h-full w-full rounded-xl object-cover"
                            fallback={
                              <div className="h-full w-full rounded-xl bg-surface" />
                            }
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePhoto(photo.id)}
                          className="absolute -right-2 -top-2 size-5 rounded-full bg-foreground text-xs leading-none text-white"
                          aria-label="Удалить фотографию"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => photosInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-border text-2xl text-primary hover:border-primary/40 disabled:opacity-50"
                      aria-label="Добавить фотографию"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photosInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex min-h-20 w-full items-center justify-center gap-2 text-sm font-medium text-secondary disabled:opacity-50"
                  >
                    {isUploadingPhoto ? "Загрузка..." : "Загрузить фотографии"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <FieldRow label="Название">{profile.name}</FieldRow>

            <div className="py-3 border-b border-background">
              <div className="text-muted text-sm mb-2">Логотип</div>
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                {profile.logo ? (
                  <ImageWithFallback
                    src={profile.logo}
                    alt="Logo"
                    width={96}
                    height={96}
                    sizes="96px"
                    className="w-full h-full object-cover"
                    fallback={
                      <span className="text-white text-4xl font-bold">
                        {profile.name.charAt(0)}
                      </span>
                    }
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

            <div className="pt-3">
              <div className="text-muted text-sm mb-2">Фотографии</div>
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {photoItems.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setOpenPhoto(photo.url)}
                    className="w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0 cursor-pointer"
                  >
                    <ImageWithFallback
                      src={photo.url}
                      alt="Фотография клиники"
                      width={96}
                      height={96}
                      sizes="96px"
                      className="w-full h-full object-cover"
                      fallback={<div className="w-full h-full bg-surface" />}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <PhotoLightbox src={openPhoto} onClose={() => setOpenPhoto(null)} />
    </ClinicSectionPage>
  );
};
