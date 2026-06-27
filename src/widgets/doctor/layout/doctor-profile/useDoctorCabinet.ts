"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type DoctorPrivateProfile,
  doctorCabinetKeys,
  getDoctorProfile,
  updateDoctorProfile,
} from "@/shared/api";

import type { DoctorProfileData } from "./model";

export const mapApiToProfile = (
  api: DoctorPrivateProfile,
): DoctorProfileData => ({
  fullName:
    api.full_name ??
    `${(api as unknown as { first_name?: string }).first_name ?? ""} ${(api as unknown as { last_name?: string }).last_name ?? ""}`.trim(),
  specialty: api.specialty,
  additionalSpecialty: "",
  experienceYears: String(api.experience_years),
  currentPosition: api.work_experience?.[0]?.position ?? "",
  workplace: api.work_experience?.[0]?.clinic ?? "",
  qualification: "",
  scientificDegree: "",
  gender: "",
  birthDate: "",
  city: api.city,
  languages: api.languages?.join(", ") ?? "",
  phone: api.phone ?? "",
  email: api.email ?? "",
  photo: api.photo ?? undefined,
  university: api.education?.[0]?.institution ?? "",
  graduationYear: api.education?.[0]?.year ? String(api.education[0].year) : "",
  internship: "",
  residency: "",
  diplomaSpecialty: "",
  additionalEducation: api.education?.slice(1).map((e) => e.institution) ?? [],
  licenseNumber: api.legal?.license_number ?? "",
  certificates: api.legal?.documents ?? [],
  rating: api.rating,
  totalReviews: api.reviews_count,
});

export const useDoctorCabinet = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: doctorCabinetKeys.profile(),
    queryFn: getDoctorProfile,
  });

  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (body: Partial<DoctorPrivateProfile>) =>
      updateDoctorProfile(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(doctorCabinetKeys.profile(), updated);
      toast.success("Данные сохранены");
    },
    onError: () => {
      toast.error("Не удалось сохранить. Попробуйте снова");
    },
  });

  const profile = data ? mapApiToProfile(data) : null;

  return { profile, isLoading, isSaving, error, saveProfile, rawProfile: data };
};
