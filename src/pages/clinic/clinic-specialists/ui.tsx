"use client";

import { FC } from "react";
import toast from "react-hot-toast";

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

const AddIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M8 3V13M3 8H13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

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
    onError: () => toast.error("Не удалось удалить специалиста"),
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
    <>
      <ClinicPageLayout title="Мои специалисты" desktopTitle="Мой профиль">
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">
            Мои специалисты
          </h2>
          <Link
            href="/clinic-profile/specialists/new"
            className="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
          >
            <AddIcon />
            Добавить специалиста
          </Link>
        </div>

        <div className="pb-24 md:pb-0">
          <SpecialistsList
            specialists={listItems}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </div>
      </ClinicPageLayout>

      {/* Мобайл: кнопка добавления закреплена снизу */}
      <div className="md:hidden fixed inset-x-0 bottom-0 p-4 bg-[#FAFAFA] z-30">
        <Link
          href="/clinic-profile/specialists/new"
          className="w-full py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <AddIcon />
          Добавить специалиста
        </Link>
      </div>
    </>
  );
};
