"use client";

import { FC } from "react";

import Image from "next/image";

import { StarIcon } from "@/shared/assets/icons";

import { useDoctorCabinet } from "./doctor-profile/useDoctorCabinet";

export const DoctorProfilePreviewCard: FC = () => {
  const { profile, isLoading } = useDoctorCabinet();

  if (isLoading || !profile) {
    return (
      <div className="bg-white rounded-3xl border border-border p-6 hidden xl:block animate-pulse">
        <div className="h-6 bg-surface rounded-md w-1/3 mb-6" />
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-surface mb-4" />
          <div className="h-5 bg-surface rounded-md w-1/2 mb-2" />
          <div className="h-4 bg-surface rounded-md w-2/3 mb-3" />
          <div className="h-4 bg-surface rounded-md w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border p-6 hidden xl:block">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Профиль врача
      </h3>
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center shrink-0 mb-4">
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt={profile.fullName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-3xl font-bold">
              {profile.fullName.charAt(0)}
            </span>
          )}
        </div>
        <h4 className="text-xl font-semibold text-foreground leading-tight">
          {profile.fullName}
        </h4>
        <p className="text-muted text-sm mt-1.5">
          {profile.specialty}
          {profile.additionalSpecialty
            ? ` · ${profile.additionalSpecialty}`
            : ""}
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <StarIcon className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium text-sm">
            {profile.rating}
          </span>
          <span className="text-muted text-xs">
            ({profile.totalReviews} отзывов)
          </span>
        </div>
      </div>
    </div>
  );
};
