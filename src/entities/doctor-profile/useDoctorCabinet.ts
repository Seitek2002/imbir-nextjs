"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDoctorProfile,
  updateDoctorProfile,
} from "@/shared/api/doctor-cabinet/requests";
import type { DoctorPrivateProfile } from "@/shared/api/doctor-cabinet/types";
import { doctorCabinetKeys } from "@/shared/api/queryKeys";

import type { DoctorProfileData } from "./model";

export const mapApiToProfile = (
  api: DoctorPrivateProfile,
): DoctorProfileData => ({
  // Бэк хранит ФИО как фамилия (last_name) + имя/отчество (first_name)
  fullName: [api.last_name, api.first_name].filter(Boolean).join(" ").trim(),
  specialty: api.primary_specializations?.[0] ?? "",
  additionalSpecialty: api.narrow_specializations?.[0] ?? "",
  experienceYears: String(api.experience_years ?? 0),
  currentPosition: api.work_experience?.[0]?.position ?? "",
  workplace: api.work_experience?.[0]?.clinic ?? "",
  qualification: "",
  scientificDegree: "",
  gender: api.gender ?? "",
  birthDate: api.birth_date ?? "",
  city: api.city ?? "",
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
  licenseNumber: api.license_number ?? "",
  certificates: [],
  rating: Number(api.rating) || 0,
  totalReviews: api.reviews_count ?? 0,
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
