"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type DoctorPrivateProfile,
  type UpdateDoctorProfileBody,
  doctorCabinetKeys,
  getDoctorProfile,
  updateDoctorProfile,
} from "@/shared/api";

import type { DoctorProfileData } from "./model";

export const mapApiToProfile = (
  api: DoctorPrivateProfile,
): DoctorProfileData => {
  // Реальный ответ /api/doctor/profile/ (плоский DoctorOwnProfile) отличается
  // от устаревшего типа DoctorPrivateProfile — читаем через каст.
  const a = api as unknown as {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    gender?: string;
    birth_date?: string | null;
    city?: string;
    languages?: string[];
    phone?: string;
    email?: string;
    photo?: string | null;
    primary_specializations?: string[];
    narrow_specializations?: string[];
    additional_services?: string;
    experience_years?: number;
    education?: { institution: string; degree?: string; year?: number }[];
    work_experience?: { position?: string; clinic?: string }[];
    license_number?: string;
    rating?: number | string;
    reviews_count?: number;
    equipment?: string[];
    patient_conditions?: string[];
    payment_methods?: string[];
  };

  return {
    fullName:
      a.full_name ?? `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(),
    specialty: a.primary_specializations?.[0] ?? "",
    additionalSpecialty: a.narrow_specializations?.[0] ?? "",
    experienceYears: String(a.experience_years ?? 0),
    currentPosition: a.work_experience?.[0]?.position ?? "",
    workplace: a.work_experience?.[0]?.clinic ?? "",
    qualification: "",
    scientificDegree: "",
    equipment: a.equipment?.join(", ") ?? "",
    patientConditions: a.patient_conditions?.join(", ") ?? "",
    paymentMethods: a.payment_methods?.join(", ") ?? "",
    gender: a.gender ?? "",
    birthDate: a.birth_date ?? "",
    city: a.city ?? "",
    languages: a.languages?.join(", ") ?? "",
    phone: a.phone ?? "",
    email: a.email ?? "",
    photo: a.photo ?? undefined,
    university: a.education?.[0]?.institution ?? "",
    graduationYear: a.education?.[0]?.year ? String(a.education[0].year) : "",
    internship: "",
    residency: "",
    diplomaSpecialty: "",
    additionalEducation: a.education?.slice(1).map((e) => e.institution) ?? [],
    licenseNumber: a.license_number ?? "",
    certificates: [],
    rating: Number(a.rating) || 0,
    totalReviews: a.reviews_count ?? 0,
  };
};

export const useDoctorCabinet = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: doctorCabinetKeys.profile(),
    queryFn: getDoctorProfile,
  });

  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (body: UpdateDoctorProfileBody) => {
      // Бэк требует first_name+last_name на КАЖДОМ PUT профиля. Под-страницы
      // (проф. данные, документы, образование) их не шлют → был 400.
      // Подставляем из текущего профиля, если явно не заданы.
      const raw = data as unknown as {
        first_name?: string;
        last_name?: string;
      } | null;
      return updateDoctorProfile({
        first_name: raw?.first_name,
        last_name: raw?.last_name,
        ...body,
      });
    },
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
