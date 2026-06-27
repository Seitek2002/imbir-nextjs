"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ClinicPrivateProfile,
  clinicCabinetKeys,
  getClinicProfile,
  updateClinicProfile,
} from "@/shared/api";

import type { ClinicProfile } from "./model";

export const mapApiToClinicProfile = (
  api: ClinicPrivateProfile,
): ClinicProfile => ({
  id: String(api.id),
  name: api.name,
  logo: api.logo ?? undefined,
  type: api.clinic_type ?? "",
  description: api.about ?? "",
  photos: api.photos ?? [],
  country: "Кыргызстан",
  city: api.city,
  fullAddress: api.address ?? "",
  phone: api.phone ?? "",
  email: api.email ?? "",
  website: api.website ?? "",
  workSchedule: {
    mon: { enabled: true, open: "09:00", close: "18:00" },
    tue: { enabled: true, open: "09:00", close: "18:00" },
    wed: { enabled: true, open: "09:00", close: "18:00" },
    thu: { enabled: true, open: "09:00", close: "18:00" },
    fri: { enabled: true, open: "09:00", close: "18:00" },
    sat: { enabled: false, open: "09:00", close: "14:00" },
    sun: { enabled: false, open: "09:00", close: "14:00" },
    lunchStart: "12:00",
    lunchEnd: "13:00",
    emergency24: false,
  },
  legalName: api.legal_name ?? "",
  registrationNumber: api.reg_number ?? "",
  licenseNumber: api.license_number ?? "",
  licenseDate: api.license_date ?? "",
  licenseAuthority: api.license_authority ?? "",
  documents: [],
  mainDirections: api.primary_specializations ?? [],
  narrowDirections: [],
  additionalServices: [],
  equipment: api.equipment ?? [],
  patientConditions: api.patient_conditions ?? [],
  paymentMethods: api.payment_methods ?? [],
  rating: api.rating,
});

export const useClinicCabinet = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: clinicCabinetKeys.profile(),
    queryFn: getClinicProfile,
  });

  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (body: Partial<ClinicPrivateProfile>) =>
      updateClinicProfile(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(clinicCabinetKeys.profile(), updated);
      toast.success("Данные сохранены");
    },
    onError: () => {
      toast.error("Не удалось сохранить. Попробуйте снова");
    },
  });

  const profile = data ? mapApiToClinicProfile(data) : null;

  return { profile, isLoading, isSaving, error, saveProfile, rawProfile: data };
};
