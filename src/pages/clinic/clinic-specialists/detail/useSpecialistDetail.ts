"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type DoctorDetail,
  clinicCabinetKeys,
  detachClinicDoctor,
  doctorKeys,
  getDoctorById,
} from "@/shared/api";
import { toHttps } from "@/shared/lib/media";

import type { SpecialistFormState } from "../specialist-form";

// Полные данные врача берём из детали /api/doctors/{id}/ — список клиники
// (getClinicDoctors) отдаёт только id/ФИО/специальность/фото, из-за чего секции
// «Профессиональные данные», «Образование» и т.д. оставались пустыми, хотя на
// бэке данные есть.
const mapDoctorToForm = (d: DoctorDetail): Partial<SpecialistFormState> => {
  const edu = d.education?.[0];
  const work = d.work_experience?.[0];
  return {
    fullName: d.full_name,
    photoPreview: toHttps(d.photo) ?? undefined,
    specialization: d.specialty ?? "",
    experienceYears: d.experience_years ? String(d.experience_years) : "",
    languages: (d.languages ?? []).join(", "),
    phone: d.phone ?? "",
    email: d.email ?? "",
    city: d.city ?? "",
    position: work?.position ?? "",
    workplace: work?.clinic ?? "",
    // work_experience — свободный JSON: qualification/scientific_degree там
    // реально встречаются (проверено живым запросом), просто не у каждой
    // записи сразу.
    qualification: work?.qualification ?? "",
    degree: work?.scientific_degree ?? "",
    university: edu?.institution ?? "",
    graduationYear: edu?.year ? String(edu.year) : "",
    diplomaSpecialty: edu?.degree ?? "",
    additionalEducation: d.about ?? "",
  };
};

export const useSpecialistDetail = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: specialist, isLoading } = useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => getDoctorById(id),
    enabled: !!id,
  });

  // Мемоизируем начальное значение формы: его идентичность стабильна, пока не
  // изменится detail, — по нему useSpecialistForm понимает, что пора
  // пересеять поля (данные приходят асинхронно, а useState-инициализатор
  // срабатывает лишь однажды).
  const initialForm = useMemo(
    () => (specialist ? mapDoctorToForm(specialist) : undefined),
    [specialist],
  );

  const deleteMutation = useMutation({
    mutationFn: () => detachClinicDoctor(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.doctors() });
      toast.success("Специалист откреплён от клиники");
      router.push("/clinic-profile/specialists");
    },
    onError: () => toast.error("Не удалось открепить специалиста"),
  });

  return {
    specialist: specialist ?? null,
    initialForm,
    isLoading,
    deleteMutation,
  };
};
