"use client";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clinicCabinetKeys,
  detachClinicDoctor,
  getClinicDoctors,
} from "@/shared/api";

// Отдельного GET /api/clinic/doctors/{id}/ нет — берём специалиста из общего
// списка (тот же приём, что уже используется для процедур клиники).
export const useSpecialistDetail = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.doctors(),
    queryFn: getClinicDoctors,
  });

  const specialist =
    (data?.data ?? []).find((d) => String(d.id) === id) ?? null;

  const deleteMutation = useMutation({
    mutationFn: () => detachClinicDoctor(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.doctors() });
      toast.success("Специалист откреплён от клиники");
      router.push("/clinic-profile/specialists");
    },
    onError: () => toast.error("Не удалось открепить специалиста"),
  });

  return { specialist, isLoading, deleteMutation };
};
