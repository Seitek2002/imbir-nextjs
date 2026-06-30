"use client";

import { FC } from "react";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicSidebar } from "@/widgets/clinic/sidebar";

import { useClinicCabinet } from "@/entities/clinic-profile";
import type { Specialist } from "@/entities/clinic-specialist";

import {
  clinicCabinetKeys,
  detachClinicDoctor,
  getClinicDoctors,
} from "@/shared/api";

import { SpecialistsList } from "./specialists-list";

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
    <div className="w-full min-h-screen">
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">
          Мои специалисты
        </h1>
        <Link
          href="/clinic-profile/invites"
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Пригласить
        </Link>
      </div>

      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
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
          </main>
        </div>
      </div>
    </div>
  );
};
