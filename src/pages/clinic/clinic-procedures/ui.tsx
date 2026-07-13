"use client";

import { FC } from "react";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  clinicCabinetKeys,
  deleteClinicService,
  getClinicServices,
} from "@/shared/api";

import { ProceduresList } from "./procedures-list";
import type { Procedure } from "./procedures-list/clinic-procedure/model";

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

export const ClinicProceduresPage: FC = () => {
  const { profile } = useClinicCabinet();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: clinicCabinetKeys.services(),
    queryFn: getClinicServices,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClinicService(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
    },
  });

  const procedures: Procedure[] = (data?.data ?? []).map((s) => ({
    id: String(s.id),
    name: s.name,
    category: s.category,
    clinic: profile?.name ?? "",
    price:
      typeof s.price === "string" ? parseFloat(s.price) || 0 : (s.price ?? 0),
  }));

  return (
    <>
      <ClinicPageLayout title="Мои процедуры" desktopTitle="Мой профиль">
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">
            Мои процедуры
          </h2>
          <Link
            href="/clinic-profile/procedures/new"
            className="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
          >
            <AddIcon />
            Добавить процедуру
          </Link>
        </div>

        <div className="pb-24 md:pb-0">
          <ProceduresList
            procedures={procedures}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </div>
      </ClinicPageLayout>

      {/* Мобайл: кнопка добавления закреплена снизу */}
      <div className="md:hidden fixed inset-x-0 bottom-0 p-4 bg-[#FAFAFA] z-30">
        <Link
          href="/clinic-profile/procedures/new"
          className="w-full py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <AddIcon />
          Добавить процедуру
        </Link>
      </div>
    </>
  );
};
