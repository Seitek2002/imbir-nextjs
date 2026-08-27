"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  resolveSpecializationIds,
  useSpecializations,
} from "@/entities/specialization";

import {
  clinicCabinetKeys,
  deleteClinicDoctorDocument,
  detachClinicDoctor,
  getClinicDoctor,
  getClinicDoctorDocuments,
  updateClinicDoctor,
  uploadClinicDoctorDocument,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";

import {
  type SpecialistFormState,
  fromDoctorProfile,
  toDoctorProfileBody,
} from "../specialist-form";

// Карточку читаем из кабинета клиники (/api/clinic/doctors/{id}/), а не из
// публичной детали врача: у клиники своя, более полная и редактируемая версия
// (должность, категория, научная степень, лицензия).
export const useSpecialistDetail = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const doctorId = Number(id);

  const { data: specialist, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.doctor(doctorId),
    queryFn: () => getClinicDoctor(doctorId),
    enabled: Number.isFinite(doctorId),
  });

  const { data: documents = [] } = useQuery({
    queryKey: clinicCabinetKeys.doctorDocuments(doctorId),
    queryFn: () => getClinicDoctorDocuments(doctorId),
    enabled: Number.isFinite(doctorId),
  });

  // Мемоизируем начальное значение формы: его идентичность стабильна, пока не
  // изменится карточка, — по нему useSpecialistForm понимает, что пора
  // пересеять поля (данные приходят асинхронно, а useState-инициализатор
  // срабатывает лишь однажды).
  const initialForm = useMemo(
    () => (specialist ? fromDoctorProfile(specialist) : undefined),
    [specialist],
  );

  // Для сохранения резолвим полный справочник: scope=doctor используется для
  // UI, но старое значение карточки может временно отсутствовать среди
  // опубликованных врачей.
  const { data: specializationList = [] } = useSpecializations();

  const invalidateCard = () => {
    queryClient.invalidateQueries({
      queryKey: clinicCabinetKeys.doctor(doctorId),
    });
    queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.doctors() });
  };

  const saveMutation = useMutation({
    mutationFn: (d: SpecialistFormState) => {
      const primary = resolveSpecializationIds(
        d.specialization ? [d.specialization] : [],
        specializationList,
      );
      const narrow = resolveSpecializationIds(
        d.additionalSpecialization ? [d.additionalSpecialization] : [],
        specializationList,
      );
      return updateClinicDoctor(
        doctorId,
        toDoctorProfileBody(d, { primary: primary.ids, narrow: narrow.ids }),
      );
    },
    onSuccess: () => {
      invalidateCard();
      toast.success("Карточка специалиста сохранена");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось сохранить карточку"));
    },
  });

  const invalidateDocuments = () =>
    queryClient.invalidateQueries({
      queryKey: clinicCabinetKeys.doctorDocuments(doctorId),
    });

  // Сертификаты уходят сразу, мимо «Сохранить»: у них своя ручка, и копить их
  // в состоянии формы было бы нечем отправить.
  const { mutateAsync: uploadDocument, isPending: isUploadingDocument } =
    useMutation({
      mutationFn: (file: File) => uploadClinicDoctorDocument(doctorId, file),
      onSuccess: () => {
        invalidateDocuments();
        toast.success("Документ загружен");
      },
      onError: () => toast.error("Не удалось загрузить документ"),
    });

  const { mutateAsync: deleteDocument } = useMutation({
    mutationFn: (documentId: number) =>
      deleteClinicDoctorDocument(doctorId, documentId),
    onSuccess: () => {
      invalidateDocuments();
      toast.success("Документ удалён");
    },
    onError: () => toast.error("Не удалось удалить документ"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => detachClinicDoctor(doctorId),
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
    saveMutation,
    deleteMutation,
    documents,
    uploadDocument,
    deleteDocument,
    isUploadingDocument,
  };
};
