"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ClinicPrivateProfile,
  type UpdateClinicProfileBody,
  clinicCabinetKeys,
  deleteClinicDocument,
  deleteClinicPhoto,
  getClinicDocuments,
  getClinicPhotos,
  getClinicProfile,
  updateClinicProfile,
  uploadClinicDocument,
  uploadClinicPhoto,
} from "@/shared/api";
import { toHttps } from "@/shared/lib/media";

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

  const { data: documentsData = [] } = useQuery({
    queryKey: clinicCabinetKeys.documents(),
    queryFn: getClinicDocuments,
    enabled: !!data,
  });

  const { data: photosData = [] } = useQuery({
    queryKey: clinicCabinetKeys.photos(),
    queryFn: getClinicPhotos,
    enabled: !!data,
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

  const uploadDocumentMutation = useMutation({
    mutationFn: uploadClinicDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicCabinetKeys.documents(),
      });
      toast.success("Документ загружен");
    },
    onError: () => toast.error("Не удалось загрузить документ"),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteClinicDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clinicCabinetKeys.documents(),
      });
      toast.success("Документ удалён");
    },
    onError: () => toast.error("Не удалось удалить документ"),
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadClinicPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.photos() });
      toast.success("Фотография загружена");
    },
    onError: () => toast.error("Не удалось загрузить фотографию"),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: deleteClinicPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.photos() });
      toast.success("Фотография удалена");
    },
    onError: () => toast.error("Не удалось удалить фотографию"),
  });

  const documentItems = useMemo(
    () =>
      documentsData.map((document, index) => ({
        ...document,
        url: toHttps(document.url) ?? document.url,
        name:
          decodeURIComponent(document.url.split("/").pop() || "") ||
          `Документ ${index + 1}`,
      })),
    [documentsData],
  );
  const photoItems = useMemo(
    () =>
      photosData.map((photo) => ({
        ...photo,
        url: toHttps(photo.url) ?? photo.url,
      })),
    [photosData],
  );

  const profile = useMemo(
    () =>
      data
        ? {
            ...mapApiToClinicProfile(data),
            documents: documentItems,
            photos: photoItems.map((photo) => photo.url),
          }
        : null,
    [data, documentItems, photoItems],
  );

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    rawProfile: data,
    documentItems,
    photoItems,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isUploadingDocument: uploadDocumentMutation.isPending,
    uploadPhoto: uploadPhotoMutation.mutateAsync,
    deletePhoto: deletePhotoMutation.mutateAsync,
    isUploadingPhoto: uploadPhotoMutation.isPending,
  };
};
