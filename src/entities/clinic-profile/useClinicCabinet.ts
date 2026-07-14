"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ClinicPrivateProfile,
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

type ApiScheduleDay = { from: string; to: string; enabled: boolean };
type ApiSchedule = Record<string, ApiScheduleDay> | undefined;

const mapDay = (day?: ApiScheduleDay): WorkDaySchedule => ({
  enabled: day?.enabled ?? false,
  open: day?.from ?? "",
  close: day?.to ?? "",
});

// Расписание, обед и экстренный режим — все реально приходят с бэка
// (см. GET /api/clinic/profile/: schedule, lunch_break, emergency_24_7).
const mapWorkSchedule = (api: ClinicPrivateProfile): ClinicScheduleData => {
  const schedule = api.schedule as ApiSchedule;
  return {
    mon: mapDay(schedule?.monday),
    tue: mapDay(schedule?.tuesday),
    wed: mapDay(schedule?.wednesday),
    thu: mapDay(schedule?.thursday),
    fri: mapDay(schedule?.friday),
    sat: mapDay(schedule?.saturday),
    sun: mapDay(schedule?.sunday),
    lunchStart: api.lunch_break?.from ?? "",
    lunchEnd: api.lunch_break?.to ?? "",
    emergency24: api.emergency_24_7 ?? false,
  };
};

// "Анализы, УЗИ, Рентген" → ["Анализы", "УЗИ", "Рентген"]
const parseCsv = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export const mapApiToClinicProfile = (
  api: ClinicPrivateProfile,
): ClinicProfile => ({
  // API не всегда отдаёт id клиники — не превращаем undefined в строку "undefined"
  id: api.id ? String(api.id) : "",
  name: api.name,
  logo: api.logo ?? undefined,
  type: api.clinic_type ?? "",
  description: api.description ?? "",
  photos: [],
  country: api.country || "Кыргызстан",
  city: api.city,
  fullAddress: api.address ?? "",
  phone: api.phone ?? "",
  email: api.email ?? "",
  website: api.website ?? "",
  latitude: api.latitude ?? "",
  longitude: api.longitude ?? "",
  workSchedule: mapWorkSchedule(api),
  legalName: api.legal_name ?? "",
  registrationNumber: api.reg_number ?? "",
  licenseNumber: api.license_number ?? "",
  licenseDate: api.license_date ?? "",
  licenseAuthority: api.license_authority ?? "",
  documents: [],
  mainDirections: api.primary_specializations ?? [],
  narrowDirections: api.narrow_specializations ?? [],
  additionalServices: parseCsv(api.additional_services),
  equipment: api.equipment ?? [],
  patientConditions: api.patient_conditions ?? [],
  paymentMethods: api.payment_methods ?? [],
  // API отдаёт rating строкой ("0.00") — приводим к number, иначе непустая
  // строка всегда truthy и бейдж рейтинга показывается даже без реальных отзывов.
  rating: Number(api.rating) || 0,
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
