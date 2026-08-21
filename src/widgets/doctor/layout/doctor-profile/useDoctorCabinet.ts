"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type DoctorPrivateProfile,
  type SpecializationItem,
  type UpdateDoctorProfileBody,
  doctorCabinetKeys,
  getDoctorDocuments,
  getDoctorProfile,
  updateDoctorProfile,
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
    // Бэк отдаёт объекты {id, name, photo}, не строки (проверено живым
    // запросом) — читаем .name, а не значение целиком.
    primary_specializations?: SpecializationItem[];
    narrow_specializations?: SpecializationItem[];
    additional_services?: string;
    experience_years?: number;
    education?: { institution: string; degree?: string; year?: number }[];
    work_experience?: {
      position?: string;
      clinic?: string;
      qualification?: string;
      scientific_degree?: string;
    }[];
    license_number?: string;
    rating?: number | string;
    reviews_count?: number;
    equipment?: string[];
    patient_conditions?: string[];
    payment_methods?: string[];
    is_online_available?: boolean;
    consultation_price?: string | number | null;
    is_published?: boolean;
  };

  return {
    fullName:
      a.full_name ?? `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(),
    specialty: translateSpecialty(a.primary_specializations?.[0]?.name ?? ""),
    additionalSpecialty: translateSpecialty(
      a.narrow_specializations?.[0]?.name ?? "",
    ),
    experienceYears: String(a.experience_years ?? 0),
    // Проф. данные держим в первой записи work_experience: бэк сохраняет её как
    // произвольный JSON и возвращает лишние ключи как есть (проверено), а
    // отдельных полей должность/место/категория/степень в контракте нет.
    currentPosition: a.work_experience?.[0]?.position ?? "",
    workplace: a.work_experience?.[0]?.clinic ?? "",
    qualification: a.work_experience?.[0]?.qualification ?? "",
    scientificDegree: a.work_experience?.[0]?.scientific_degree ?? "",
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
    diplomaSpecialty: a.education?.[0]?.degree ?? "",
    additionalEducation: a.education?.slice(1).map((e) => e.institution) ?? [],
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
  const { data: documents = [] } = useQuery({
    queryKey: [...doctorCabinetKeys.profile(), "documents"],
    queryFn: getDoctorDocuments,
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

  const profile = data
    ? { ...mapApiToProfile(data), certificates: documents.map((d) => d.url) }
    : null;

  return { profile, isLoading, isSaving, error, saveProfile, rawProfile: data };
};
