"use client";

import { FC } from "react";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicSidebar } from "@/widgets/clinic/sidebar";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  clinicCabinetKeys,
  deleteClinicService,
  getClinicServices,
} from "@/shared/api";

import { ProceduresList } from "./procedures-list";
import type { Procedure } from "./procedures-list/clinic-procedure/model";

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
    <div className="w-full min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">Мои процедуры</h1>
        <Link
          href="/clinic-profile/procedures/new"
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Добавить
        </Link>
      </div>

      {/* Desktop Content */}
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
                Мои процедуры
              </h2>
              <Link
                href="/clinic-profile/procedures/new"
                className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors whitespace-nowrap"
              >
                Добавить новую
              </Link>
            </div>

            <ProceduresList
              procedures={procedures}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </main>
        </div>
      </div>
    </div>
  );
};
