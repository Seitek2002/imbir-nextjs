"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ClinicPrivateProfile,
  ClinicSchedule,
  type UpdateClinicProfileBody,
  clinicCabinetKeys,
  getClinicProfile,
  updateClinicProfile,
} from "@/shared/api";

import type {
  ClinicProfile,
  ClinicScheduleData,
  WorkDaySchedule,
} from "./model";

const mapDay = (day?: ClinicSchedule[string]): WorkDaySchedule => ({
  enabled: day?.enabled ?? false,
  open: day?.from ?? "",
  close: day?.to ?? "",
});

// The API may key days as "monday" or "mon" — handle both. Lunch break and
// emergency24 aren't part of the clinic profile response yet, so they default.
const mapWorkSchedule = (schedule?: ClinicSchedule): ClinicScheduleData => ({
  mon: mapDay(schedule?.monday ?? schedule?.mon),
  tue: mapDay(schedule?.tuesday ?? schedule?.tue),
  wed: mapDay(schedule?.wednesday ?? schedule?.wed),
  thu: mapDay(schedule?.thursday ?? schedule?.thu),
  fri: mapDay(schedule?.friday ?? schedule?.fri),
  sat: mapDay(schedule?.saturday ?? schedule?.sat),
  sun: mapDay(schedule?.sunday ?? schedule?.sun),
  lunchStart: "",
  lunchEnd: "",
  emergency24: false,
});

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
  workSchedule: mapWorkSchedule(api.schedule),
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
    mutationFn: (body: UpdateClinicProfileBody) => updateClinicProfile(body),
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
