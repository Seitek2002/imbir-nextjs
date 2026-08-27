"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fromApiAdditionalEducation,
  fromApiEducation,
  fromLegacyAdditionalEducation,
} from "@/entities/doctor-education";

import {
  type DoctorDocument,
  type DoctorPrivateProfile,
  type SpecializationItem,
  type UpdateDoctorProfileBody,
  deleteDoctorDocument,
  doctorCabinetKeys,
  getDoctorDocuments,
  getDoctorProfile,
  updateDoctorProfile,
  uploadDoctorDocument,
} from "@/shared/api";

import type { DoctorProfileData } from "./model";

const SPECIALIZATION_MAP: Record<string, string> = {
  therapist: "Терапевт",
  surgeon: "Хирург",
  cardiologist: "Кардиолог",
  neurologist: "Невролог",
  dentist: "Стоматолог",
  pediatrician: "Педиатр",
  gynecologist: "Гинеколог",
  ophthalmologist: "Офтальмолог",
  ent: "Лор",
  dermatologist: "Дерматолог",
};

const EMPTY_DOCUMENTS: DoctorDocument[] = [];

const translateSpecialty = (spec: string): string => {
  if (!spec) return "";
  return SPECIALIZATION_MAP[spec.toLowerCase()] ?? spec;
};

export const mapApiToProfile = (
  api: DoctorPrivateProfile,
): DoctorProfileData => {
  // Реальный ответ /api/doctor/profile/ (плоский DoctorOwnProfile) отличается
  // от устаревшего типа DoctorPrivateProfile — читаем через каст.
  const a = api as unknown as {
    academic_degree?: string;
    additional_education?: { name?: string; year?: null | number }[];
    additional_services?: string;
    birth_date?: null | string;
    city?: string;
    consultation_price?: null | number | string;
    education?: { degree?: string; institution: string; year?: number }[];
    email?: string;
    equipment?: string[];
    experience_years?: number;
    first_name?: string;
    full_name?: string;
    gender?: string;
    is_online_available?: boolean;
    is_published?: boolean;
    languages?: string[];
    last_name?: string;
    license_number?: string;
    narrow_specializations?: SpecializationItem[];
    patient_conditions?: string[];
    payment_methods?: string[];
    phone?: string;
    photo?: null | string;
    position?: string;
    // Бэк отдаёт объекты {id, name, photo}, не строки (проверено живым
    // запросом) — читаем .name, а не значение целиком.
    primary_specializations?: SpecializationItem[];
    qualification_category?: string;
    rating?: number | string;
    reviews_count?: number;
    work_experience?: {
      clinic?: string;
      position?: string;
      qualification?: string;
      scientific_degree?: string;
    }[];
  };

  const education = fromApiEducation(a.education);
  const additionalEducation = fromApiAdditionalEducation(
    a.additional_education,
  );
  const legacyProfessional = a.work_experience?.[0];

  return {
    fullName:
      a.full_name ?? `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(),
    specialty: (a.primary_specializations ?? []).map((item) =>
      translateSpecialty(item.name),
    ),
    additionalSpecialty: (a.narrow_specializations ?? []).map((item) =>
      translateSpecialty(item.name),
    ),
    experienceYears: String(a.experience_years ?? 0),
    // Новые плоские поля не смешиваются с историей работы. Fallback оставлен
    // только для старых профилей, где данные ещё лежат в первой JSON-записи.
    currentPosition: a.position ?? legacyProfessional?.position ?? "",
    workplace: legacyProfessional?.clinic ?? "",
    qualification:
      a.qualification_category ?? legacyProfessional?.qualification ?? "",
    scientificDegree:
      a.academic_degree ?? legacyProfessional?.scientific_degree ?? "",
    equipment: a.equipment ?? [],
    patientConditions: a.patient_conditions ?? [],
    paymentMethods: a.payment_methods ?? [],
    gender: a.gender ?? "",
    birthDate: a.birth_date ?? "",
    city: a.city ?? "",
    languages: a.languages?.join(", ") ?? "",
    phone: a.phone ?? "",
    email: a.email ?? "",
    photo: a.photo ?? undefined,
    // Интернатура и ординатура остаются в education, а дополнительные курсы
    // теперь хранятся отдельно вместе с годом. Старый формат читаем как fallback.
    ...education,
    additionalEducation:
      additionalEducation.length > 0
        ? additionalEducation
        : fromLegacyAdditionalEducation(a.education),
    licenseNumber: a.license_number ?? "",
    // Заполняется в useDoctorCabinet из /api/doctor/documents/: профильный
    // ответ сертификаты не отдаёт, и раньше здесь навсегда оставался [].
    certificates: [],
    rating: Number(a.rating) || 0,
    totalReviews: a.reviews_count ?? 0,
    isOnlineAvailable: a.is_online_available ?? false,
    // Приходит как "1500.00" — в поле формы показываем без дробной части,
    // если она нулевая, иначе врач видит лишние нули при каждом открытии.
    consultationPrice:
      a.consultation_price == null
        ? ""
        : String(a.consultation_price).replace(/\.00$/, ""),
    isPublished: a.is_published ?? false,
  };
};

export const useDoctorCabinet = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: doctorCabinetKeys.profile(),
    queryFn: getDoctorProfile,
  });

  // Сертификаты живут в отдельном endpoint — профиль их не возвращает.
  const documentsKey = [...doctorCabinetKeys.profile(), "documents"];
  const { data: documents = EMPTY_DOCUMENTS } = useQuery({
    queryKey: documentsKey,
    queryFn: getDoctorDocuments,
  });

  const invalidateDocuments = () =>
    queryClient.invalidateQueries({ queryKey: documentsKey });

  // Раньше кабинет только рисовал превью через FileReader: файл не уходил
  // никуда, а удаление правило локальный стейт. Теперь оба действия идут на
  // /api/doctor/documents/.
  const { mutateAsync: uploadDocument, isPending: isUploadingDocument } =
    useMutation({
      mutationFn: uploadDoctorDocument,
      onSuccess: () => {
        invalidateDocuments();
        toast.success("Файл загружен");
      },
      onError: () => toast.error("Не удалось загрузить файл"),
    });

  const { mutateAsync: deleteDocument } = useMutation({
    mutationFn: deleteDoctorDocument,
    onSuccess: () => {
      invalidateDocuments();
      toast.success("Файл удалён");
    },
    onError: () => toast.error("Не удалось удалить файл"),
  });

  const { mutateAsync: saveProfileMutation, isPending: isSaving } = useMutation(
    {
      mutationFn: ({
        body,
        processPhoto,
      }: {
        body: UpdateDoctorProfileBody;
        processPhoto?: boolean;
      }) => {
        // Бэк требует first_name+last_name на КАЖДОМ PUT профиля. Под-страницы
        // (проф. данные, документы, образование) их не шлют → был 400.
        // Подставляем из текущего профиля, если явно не заданы.
        const raw = data as unknown as {
          first_name?: string;
          last_name?: string;
          narrow_specializations?: SpecializationItem[];
          primary_specializations?: SpecializationItem[];
        } | null;
        // Бэк очищает primary/narrow_specialization_ids, если поле не передано
        // (проверено живым запросом). Из-за этого сохранение любой другой
        // вкладки — образования, документов, расписания — стирало
        // специализации врача. Досылаем текущие, если вкладка их не меняет.
        return updateDoctorProfile(
          {
            first_name: raw?.first_name,
            last_name: raw?.last_name,
            primary_specialization_ids: raw?.primary_specializations?.map(
              (s) => s.id,
            ),
            narrow_specialization_ids: raw?.narrow_specializations?.map(
              (s) => s.id,
            ),
            ...body,
          },
          { processPhoto },
        );
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(doctorCabinetKeys.profile(), updated);
        toast.success("Данные сохранены");
      },
      onError: () => {
        toast.error("Не удалось сохранить. Попробуйте снова");
      },
    },
  );

  // `process_photo` относится только к новому файлу аватара. Оставляем
  // привычный первый аргумент для всех существующих разделов кабинета.
  const saveProfile = (
    body: UpdateDoctorProfileBody,
    options?: { processPhoto?: boolean },
  ) => saveProfileMutation({ body, processPhoto: options?.processPhoto });

  // Секции кабинета синхронизируют локальную форму при изменении ссылки на
  // profile. Без мемоизации новый объект создавался на каждом рендере, из-за
  // чего условный setState в секциях basic/professional/education/documents
  // запускался бесконечно и React показывал «Too many re-renders».
  const profile = useMemo(
    () =>
      data
        ? {
            ...mapApiToProfile(data),
            certificates: documents.map((d) => d.url),
          }
        : null,
    [data, documents],
  );

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    rawProfile: data,
    documents,
    uploadDocument,
    deleteDocument,
    isUploadingDocument,
  };
};
