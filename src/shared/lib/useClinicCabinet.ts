"use client";

import { useQuery } from "@tanstack/react-query";

import { getClinicProfile } from "@/shared/api/clinic-cabinet/requests";
import { clinicCabinetKeys } from "@/shared/api/queryKeys";

export function useClinicCabinet() {
  return useQuery({
    queryKey: clinicCabinetKeys.profile(),
    queryFn: getClinicProfile,
    retry: false,
  });
}
