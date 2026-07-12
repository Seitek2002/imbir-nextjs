"use client";

import { FC } from "react";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  clinicCabinetKeys,
  detachClinicDoctor,
  getClinicDoctors,
} from "@/shared/api";

import { type Specialist, SpecialistsList } from "./specialists-list";

export const ClinicSpecialistsPage: FC = () => {
  const { profile } = useClinicCabinet();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: clinicCabinetKeys.doctors(),
    queryFn: getClinicDoctors,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => detachClinicDoctor(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.doctors() });
    },
  });

  const listItems: Specialist[] = (data?.data ?? []).map((d) => ({
    id: String(d.id),
    name: d.full_name,
    specialty: d.specialty,
    clinic: profile?.name ?? "",
    rating: d.rating,
    reviews: 0,
    experience: 0,
    image: d.photo ?? undefined,
  }));

  return (
    <ClinicPageLayout
      title="Мои специалисты"
      desktopTitle="Мой профиль"
      mobileAction={
        <Link
          href="/clinic-profile/invites"
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Пригласить
        </Link>
      }
    >
      <div className="hidden md:flex items-center justify-between mb-6">
        <h2 className="text-[32px] font-semibold text-foreground">
          Мои специалисты
        </h2>
        <Link
          href="/clinic-profile/invites"
          className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors whitespace-nowrap"
        >
          Пригласить нового
        </Link>
      </div>

      <SpecialistsList
        specialists={listItems}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </ClinicPageLayout>
  );
};
