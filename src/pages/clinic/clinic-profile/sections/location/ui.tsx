"use client";

import { FC, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import {
  FieldRow,
  LocationMap,
  useClinicCabinet,
} from "@/entities/clinic-profile";

import { Input, PhoneInput } from "@/shared/ui";

export const ClinicLocationPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setCountry(profile.country ?? "");
    setCity(profile.city ?? "");
    setFullAddress(profile.fullAddress ?? "");
    setPhone(profile.phone ?? "");
    setWebsite(profile.website ?? "");
    setLatitude(profile.latitude ?? "");
    setLongitude(profile.longitude ?? "");
  }

  const handleSave = async () => {
    await saveProfile({
      country,
      city,
      address: fullAddress,
      phone,
      website,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
    });
    setIsEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <ClinicSectionPage
        title="Локация и контакты"
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
      title="Локация и контакты"
      isEditing={isEditing}
      isSaving={isSaving}
      onEditToggle={() => (isEditing ? handleSave() : setIsEditing(true))}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        {isEditing ? (
          <div className="flex flex-col gap-5">
            <Input
              label="Страна"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <Input
              label="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="Полный адрес"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
            <PhoneInput label="Телефон" value={phone} onChange={setPhone} />
            <Input label="Почта" type="email" value={profile.email} disabled />
            <Input
              label="Сайт"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Широта"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="42.8746"
              />
              <Input
                label="Долгота"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="74.5698"
              />
            </div>
            <LocationMap
              latitude={latitude}
              longitude={longitude}
              address={fullAddress}
            />
          </div>
        ) : (
          <div>
            <FieldRow label="Страна">{profile.country}</FieldRow>
            <FieldRow label="Город">{profile.city}</FieldRow>
            <FieldRow label="Полный адрес">{profile.fullAddress}</FieldRow>
            <FieldRow label="Телефон">{profile.phone}</FieldRow>
            <FieldRow label="Почта">{profile.email}</FieldRow>
            <FieldRow label="Сайт">{profile.website}</FieldRow>
            <div className="pt-3">
              <div className="text-muted text-sm mb-2">Геолокация</div>
              <LocationMap
                latitude={profile.latitude}
                longitude={profile.longitude}
                address={profile.fullAddress}
              />
            </div>
          </div>
        )}
      </div>
    </ClinicSectionPage>
  );
};
