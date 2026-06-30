"use client";

import { FC, useState } from "react";

import { Button } from "@/shared";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { ClinicProfileForm, useClinicCabinet } from "@/entities/clinic-profile";

const PencilIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3334 2.00001C11.5085 1.82491 11.7163 1.68602 11.9451 1.59126C12.1739 1.4965 12.4191 1.44769 12.6667 1.44769C12.9143 1.44769 13.1595 1.4965 13.3883 1.59126C13.6171 1.68602 13.8249 1.82491 14.0001 2.00001C14.1752 2.17511 14.3141 2.38291 14.4088 2.61172C14.5036 2.84052 14.5524 3.08571 14.5524 3.33334C14.5524 3.58097 14.5036 3.82617 14.4088 4.05497C14.3141 4.28377 14.1752 4.49158 14.0001 4.66668L5.00008 13.6667L1.33341 14.6667L2.33341 11L11.3334 2.00001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ClinicProfilePage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const handleSave = async () => {
    if (profile) {
      await saveProfile({
        name: profile.name,
        description: profile.description,
        phone: profile.phone || undefined,
        email: profile.email || undefined,
        website: profile.website || undefined,
        address: profile.fullAddress || undefined,
      });
    }
    setIsEditing(false);
  };
  const handleEdit = () => setIsEditing(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#838A8D]">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <h1 className="text-lg font-semibold text-[#191A1B]">Моя клиника</h1>
        {isEditing ? (
          <Button size="sm" onClick={handleSave}>
            Сохранить
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handleEdit}>
            Редактировать
          </Button>
        )}
      </div>

      {/* Desktop Content */}
      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <ClinicSidebar
            clinicName={profile?.name ?? ""}
            clinicLogo={profile?.logo}
            rating={profile?.rating ?? 0}
          />

          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-[32px] font-semibold text-[#191A1B]">
                Моя клиника
              </h2>
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Сохранение..." : "Сохранить"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  IconLeft={PencilIcon}
                  onClick={handleEdit}
                >
                  Редактировать
                </Button>
              )}
            </div>

            {profile && (
              <ClinicProfileForm {...profile} isEditing={isEditing} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
